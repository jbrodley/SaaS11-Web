---
title: "Pricing intelligence, not tokens"
date: 2026-06-02
author: "SaaS 11"
categories: ["FinOps & Pricing"]
tags: ["finops", "pricing", "tokenomics", "consumption"]
summary: "Frontier intelligence keeps repricing upward even as last generation's falls. Pricing built on uniformly cheap intelligence needs revisiting."
---

The economics of this moment are widely misread. It doesn't really matter what
tokens cost.

## The two-curve problem

The dominant narrative in AI pricing is that intelligence gets cheaper over
time. This is half right, and the half that's wrong will hurt you.

Frontier intelligence keeps repricing **upward** even as last generation's
capability falls along something close to a Moore's Law curve. Two things are
true at once: the smartest model is getting more expensive, and yesterday's
smartest model is getting cheaper. These aren't contradictory — they're two
curves operating simultaneously.

### Curve one: commoditization

Yesterday's frontier model is this year's commodity. GPT-3.5-class performance
is effectively free. GPT-4-class performance is heading there fast. Any
pricing model built on charging a premium for capability that's 18 months from
commodity is borrowing revenue from the future.

### Curve two: frontier repricing

Meanwhile, the frontier keeps getting more expensive. OpenAI, Anthropic, and
Google are all pricing their latest models higher than their predecessors. The
reasoning models, the long-context models, the multimodal models: they cost
more per token than what came before. The economics of frontier training runs
— hundreds of millions in compute, massive energy, scarce talent — mean this
trend isn't reversing.

The practical impact: if your product depends on frontier-class intelligence,
your cost basis is structurally unstable. It might go up 3x when the next
model drops, or drop 80% when your use case gets served by last-gen models.
You don't control which.

## Customers buy intelligence, not tokens

This is the core insight most pricing discussions miss. Your customer doesn't
care about tokens. They care about whether the work gets done correctly. The
unit of value is the outcome — the processed claim, the drafted contract, the
resolved ticket — not the compute required to produce it.

Pricing strategies built on the assumption that intelligence gets uniformly
cheaper need revisiting. They work in the commoditization zone and break in the
frontier zone. Since most SaaS products need both — commodity intelligence for
routine tasks, frontier for the hard cases — you need a pricing model that
survives both curves.

## Designing for the new curve

### Package outcomes, not raw usage

Customers are buying completed work. Price accordingly. A consumption model
that charges per token forces the customer to internalize your cost volatility.
They hate this — and they should, because it's not their problem to manage
your cost structure.

Outcome-based packaging looks different by domain: per claim processed, per
contract reviewed, per ticket resolved. The unit maps to something the customer
already budgets for. They know what a processed claim costs; they shouldn't
have to know what 10,000 tokens of GPT-4.1 cost.

This also gives you a natural hedge. If you're pricing per outcome and the
frontier model gets more expensive, you route more volume to the commodity
model that's now good enough. If the commodity model handles 90% of volume at
10% of the cost, your margins improve even as frontier prices increase. You
absorb the variability internally — which is where it belongs.

### Build consumption pricing that survives both directions

The trick isn't picking one model. It's building flexibility so you're not
locked into a pricing structure that becomes unprofitable when costs shift.

**Tiered intelligence routing**: use the cheapest model that reliably completes
the task, escalate to frontier only when needed. Most products have a heavily
right-skewed difficulty distribution — 80% handled by commodity models, 20%
need frontier, 5% still need a human. Price for the full distribution, not the
median.

**Commit-and-drawdown** structures give customers predictability (annual
commit based on projected volume) while giving you a margin buffer. Model
cost changes are your problem, not theirs.

### Treat FinOps as a product surface, not a back-office concern

FinOps is treated as a back-office function. In a world where model costs are a
significant and variable input, it needs to be a product surface.

- **Real-time cost visibility** in the product. Customers should see what
  they're spending, what they're spending it on, and what they're getting —
  without filing a support ticket.

- **Budget controls and alerts** as first-class features. Let customers set
  spend limits, configure routing rules, and receive alerts before they hit
  them. This is table stakes for any product that charges for variable
  consumption.

- **Cost optimization recommendations** built into the workflow. The product
  should tell customers when they could achieve the same outcome at lower cost
  — not wait for them to discover it on their invoice. This builds trust and
  reduces churn.

When FinOps is a product surface, cost management becomes a demonstration of
partnership, not a source of surprise.

## Pricing models worth studying

- **Per-outcome with quality tiers.** Base price per claim processed, premium
  tier for higher accuracy guarantees. The customer chooses their risk
  tolerance; you route to the appropriate model.

- **Platform fee plus consumption.** Fixed fee covers the product and
  commodity intelligence; consumption charges apply only for frontier. Transparent
  and aligned.

- **Value-based with FinOps dashboards.** Price anchored to value delivered
  (e.g., "10% of what you'd pay a human"), with full compute transparency.

## The bigger shift

The work underneath is familiar — digital transformation — entering possibly
its most consequential chapter: service delivered as software. The pricing
models that survive will abstract away model economics and let customers buy
what they actually want: work, done correctly, at a predictable price.
