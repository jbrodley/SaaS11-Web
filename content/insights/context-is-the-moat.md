---
title: "Service-as-Software: why context is the moat"
date: 2026-06-10
author: "SaaS 11"
categories: ["AI & Agents"]
tags: ["agents", "service-as-software", "moats"]
summary: "As agents and orchestration become table stakes, durable advantage shifts to the data, workflows, and constraints only you hold."
---

For two decades, software sold **tools** that helped people do their work. AI
now lets software **do the work itself**. The industry is mid-transition to
what we call Service-as-Software — completed work, delivered as software.

## The tooling race is converging

Agents, harnesses, orchestration: give it two years (or less) and these layers
become table stakes. If the differentiator is the framework, there is no
differentiator.

The durable advantage sits in **context** — the data, workflows, constraints,
and tacit knowledge that let an agent be trusted to *act*, not just suggest.
The vendor that holds that context is the one whose agents can be trusted to
execute. Twenty years of domain depth suddenly compounds in a way the market
hasn't fully priced.

## Why model quality alone isn't defensible

There's a seductive narrative in AI right now: whoever has the smartest model
wins. It's wrong, and the reason is structural. Model capability is moving too
fast for any single provider to hold a durable edge. The gap between frontier
and commodity collapses every 12-18 months. GPT-4-class performance is already
available from multiple providers at a fraction of the original cost. If your
product's defensibility depends on being the thinnest wrapper around the
smartest model, you're building on sand.

What's actually scarce is not intelligence — it's **trust to act**. An agent
that can generate a plausible answer is now cheap. An agent that can be trusted
to execute a workflow end-to-end, in a specific domain, with specific
constraints, without causing damage — that's still rare. And the thing that
enables that trust is context.

## What context actually looks like

Context isn't one thing. It's three layers, each with different defensibility
characteristics:

### Proprietary data

The data your product accumulates that no one else has — usage patterns,
edge-case outcomes, domain-specific corpora, annotated exceptions. A legal AI
company that's seen ten million contract redlines has context that no
foundation model was trained on. A claims-processing platform that knows which
denial codes correlate with appeals success has data density that can't be
replicated from the outside. This is the most obviously defensible layer.

### Tacit knowledge

The stuff your best users know but can't articulate — the "we always do it
this way because of X" patterns that live in senior employees' heads and
never make it into documentation. Capturing this is hard work. It means
sitting with operators, shadowing workflows, and encoding judgment calls as
rules. Most companies skip this because it's unglamorous. That's exactly why
it's valuable.

### Workflow constraints

The real-world guardrails that keep an agent from doing damage: regulatory
requirements, approval chains, integration-specific quirks, exception
handling paths. These constraints are messy, domain-specific, and expensive to
discover. They're also the difference between an agent that suggests and an
agent that ships.

A healthcare AI that knows CPT codes isn't useful. One that knows a
specific payer denies code 99213 when paired with modifier 25 from this
particular group — and routes around it — is a product.

## A framework for auditing your context assets

Ask yourself three questions, honestly:

1. **What data do I have that a competitor starting from scratch couldn't
   replicate in two years?** If the answer is "nothing" or "our training
   data from the public internet," you don't have a data moat. You have a
   head start, which is different.

2. **What decisions do my best users make that they can't explain?** Every
   "it depends" is an opportunity to encode tacit knowledge. Map them. The
   ones that are frequent, high-value, and inconsistent across users are the
   highest-leverage encoding targets.

3. **Where are the failure modes that would make a customer never trust an
   agent again?** These are your constraint surface. If you can't articulate
   the guardrails, you can't automate within them — and your agent will
   inevitably find the edge case you didn't specify.

## What that means in practice

- Treat your proprietary data and workflows as the product, not the model.
- Invest in the plumbing that turns tacit knowledge into machine-usable context.
- Design agents to take action with guardrails, then earn more autonomy over time.
- Audit your context assets with the same rigor you'd audit your financials.

That is the work: turning domain depth into software that does the job. The
companies that get this right won't just have better AI — they'll have AI that
can be trusted with real work, in real domains, with real consequences. That's
the moat. Everything else is a feature.
