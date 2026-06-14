# Form handler (AWS Lambda + SES)

`contact_handler.py` powers both the **contact form** and the **newsletter
signup** on the static site. The site posts form data to an API Gateway HTTP
API; this function emails the message via SES (and optionally stores newsletter
emails in DynamoDB).

## 1. Verify a sender in SES

Verify your domain (or at least `SES_FROM`) in Amazon SES, and verify
`CONTACT_TO` if your account is still in the SES sandbox. Region must match
`SES_REGION`.

## 2. Create the Lambda

```bash
cd scripts/lambda
zip function.zip contact_handler.py

aws lambda create-function \
  --function-name saas11-form-handler \
  --runtime python3.13 \
  --handler contact_handler.handler \
  --zip-file fileb://function.zip \
  --role arn:aws:iam::<ACCOUNT_ID>:role/saas11-form-handler-role \
  --timeout 10 \
  --region us-west-2 \
  --environment "Variables={SES_REGION=us-west-2,SES_FROM=no-reply@saas11.com,CONTACT_TO=hello@saas11.com,ALLOW_ORIGIN=https://www.saas11.com}"
```

The execution role needs `ses:SendEmail` (and `dynamodb:PutItem` on the
subscribers table if you set `SUBSCRIBERS_TABLE`), plus the basic Lambda
logging policy.

## 3. Expose it via API Gateway (HTTP API)

```bash
aws apigatewayv2 create-api \
  --name saas11-forms \
  --protocol-type HTTP \
  --target arn:aws:lambda:us-west-2:<ACCOUNT_ID>:function:saas11-form-handler \
  --cors-configuration AllowOrigins=https://www.saas11.com,AllowMethods=POST,AllowHeaders=content-type
```

Add the Lambda invoke permission for API Gateway, then note the invoke URL —
e.g. `https://abc123.execute-api.us-west-2.amazonaws.com`. Point a custom
domain (`api.saas11.com`) at it if you like.

## 4. Wire the site to it

In `hugo.toml`:

```toml
[params.forms]
  contactAction    = "https://api.saas11.com/contact"
  newsletterAction = "https://api.saas11.com/subscribe"
```

(Or use the raw API Gateway URL with a `?form=contact` style route — the
handler also branches on the hidden `form` field, so a single endpoint works
for both.)

## Prefer a hosted service instead?

If you'd rather not run any backend, set `contactAction` / `newsletterAction`
to a **Formspree** or **Web3Forms** endpoint — the form markup and the
`fetch`-based JS in `assets/js/theme.js` already work with them. For the
newsletter specifically, you can also point `newsletterAction` directly at a
**Buttondown / ConvertKit / Mailchimp** embed form action.
