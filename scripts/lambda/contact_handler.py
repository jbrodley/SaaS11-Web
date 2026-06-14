"""
SaaS 11 — contact + newsletter form handler (AWS Lambda).

A single function behind an API Gateway HTTP API that the static site posts to.
It branches on the ``form`` field:

  * ``contact``    -> emails the inbound message to CONTACT_TO via SES.
  * ``newsletter`` -> records the subscriber (SES notification + optional
                      DynamoDB store) so you can sync to your ESP later.

It is intentionally dependency-free (boto3 is in the Lambda runtime) and does
its own form parsing so it works with both ``application/x-www-form-urlencoded``
and ``multipart/form-data`` posts from the browser ``fetch`` in theme.js.

Environment variables
---------------------
  SES_REGION        AWS region for SES (e.g. us-west-2)
  SES_FROM          Verified "from" address (e.g. no-reply@saas11.com)
  CONTACT_TO        Where contact messages are delivered (e.g. hello@saas11.com)
  NEWSLETTER_TO     Where new-subscriber notices go (defaults to CONTACT_TO)
  SUBSCRIBERS_TABLE Optional DynamoDB table to store newsletter emails
  ALLOW_ORIGIN      CORS origin to echo back (e.g. https://www.saas11.com)
"""

import base64
import cgi
import io
import json
import os
import re
from urllib.parse import parse_qs

import boto3

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _cors_headers():
    return {
        "Access-Control-Allow-Origin": os.environ.get("ALLOW_ORIGIN", "*"),
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Accept",
        "Content-Type": "application/json",
    }


def _respond(status, body):
    return {"statusCode": status, "headers": _cors_headers(), "body": json.dumps(body)}


def _parse_body(event):
    """Return a dict of form fields from an API Gateway (v1/v2) proxy event."""
    raw = event.get("body") or ""
    if event.get("isBase64Encoded"):
        raw = base64.b64decode(raw).decode("utf-8", "replace")

    headers = {k.lower(): v for k, v in (event.get("headers") or {}).items()}
    ctype = headers.get("content-type", "")

    if ctype.startswith("multipart/form-data"):
        env = {"REQUEST_METHOD": "POST", "CONTENT_TYPE": ctype}
        fs = cgi.FieldStorage(fp=io.BytesIO(raw.encode("utf-8")), environ=env)
        return {k: fs.getfirst(k, "") for k in (fs.keys() or [])}

    # Default: urlencoded
    return {k: v[0] for k, v in parse_qs(raw).items()}


def _ses():
    return boto3.client("ses", region_name=os.environ.get("SES_REGION"))


def _send_email(to_addr, subject, body, reply_to=None):
    kwargs = {
        "Source": os.environ["SES_FROM"],
        "Destination": {"ToAddresses": [to_addr]},
        "Message": {
            "Subject": {"Data": subject},
            "Body": {"Text": {"Data": body}},
        },
    }
    if reply_to:
        kwargs["ReplyToAddresses"] = [reply_to]
    _ses().send_email(**kwargs)


def _store_subscriber(email):
    table = os.environ.get("SUBSCRIBERS_TABLE")
    if not table:
        return
    boto3.resource("dynamodb").Table(table).put_item(
        Item={"email": email.lower(), "source": "saas11.com"}
    )


def handler(event, context):
    # CORS preflight
    method = (
        event.get("requestContext", {}).get("http", {}).get("method")
        or event.get("httpMethod")
        or "POST"
    )
    if method == "OPTIONS":
        return {"statusCode": 204, "headers": _cors_headers(), "body": ""}

    fields = _parse_body(event)

    # Honeypot: silently accept (200) so bots don't retry, but do nothing.
    if fields.get("company_website"):
        return _respond(200, {"ok": True})

    email = (fields.get("email") or "").strip()
    if not EMAIL_RE.match(email):
        return _respond(400, {"ok": False, "error": "A valid email is required."})

    form_type = (fields.get("form") or "contact").strip()

    try:
        if form_type == "newsletter":
            _store_subscriber(email)
            _send_email(
                os.environ.get("NEWSLETTER_TO", os.environ["CONTACT_TO"]),
                "New SaaS 11 newsletter subscriber",
                f"New subscriber: {email}",
            )
            return _respond(200, {"ok": True})

        # contact
        name = (fields.get("name") or "").strip()
        company = (fields.get("company") or "").strip()
        message = (fields.get("message") or "").strip()
        if not message:
            return _respond(400, {"ok": False, "error": "Message is required."})

        body = (
            f"Name:    {name}\n"
            f"Email:   {email}\n"
            f"Company: {company}\n\n"
            f"{message}\n"
        )
        _send_email(
            os.environ["CONTACT_TO"],
            f"SaaS 11 contact — {name or email}",
            body,
            reply_to=email,
        )
        return _respond(200, {"ok": True})

    except Exception as exc:  # noqa: BLE001 — surface a generic error to the client
        print(f"form handler error: {exc!r}")
        return _respond(502, {"ok": False, "error": "Could not send right now."})
