/**
 * SaaS 11 — front-end behaviour (vanilla JS, no dependencies).
 */
(function () {
	'use strict';

	document.addEventListener('DOMContentLoaded', function () {
		/* ---- Sticky header state ---- */
		var header = document.getElementById('site-header');
		if (header) {
			var onScroll = function () {
				header.classList.toggle('is-stuck', window.scrollY > 8);
			};
			onScroll();
			window.addEventListener('scroll', onScroll, { passive: true });
		}

		/* ---- Smooth anchor scrolling (respects sticky header) ---- */
		document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
			anchor.addEventListener('click', function (e) {
				var id = this.getAttribute('href').slice(1);
				var target = document.getElementById(id);
				if (!target) return;
				e.preventDefault();
				var headerH = header ? header.offsetHeight : 0;
				var top = target.getBoundingClientRect().top + window.scrollY - headerH - 8;
				window.scrollTo({ top: top, behavior: 'smooth' });
				history.replaceState(null, '', '#' + id);
				// Close mobile nav if open
				if (nav && nav.classList.contains('is-open')) {
					nav.classList.remove('is-open');
					if (toggle) toggle.setAttribute('aria-expanded', 'false');
				}
			});
		});

		/* ---- Handle hash on page load (cross-page anchors) ---- */
		if (window.location.hash) {
			var hashTarget = document.getElementById(window.location.hash.slice(1));
			if (hashTarget) {
				setTimeout(function () {
					var headerH = header ? header.offsetHeight : 0;
					var top = hashTarget.getBoundingClientRect().top + window.scrollY - headerH - 8;
					window.scrollTo({ top: top, behavior: 'smooth' });
				}, 100);
			}
		}

		/* ---- Mobile nav toggle ---- */
		var toggle = document.getElementById('nav-toggle');
		var nav = document.getElementById('primary-nav');
		if (toggle && nav) {
			toggle.addEventListener('click', function () {
				var open = nav.classList.toggle('is-open');
				toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
			});
			nav.addEventListener('click', function (e) {
				if (e.target.closest('a')) {
					nav.classList.remove('is-open');
					toggle.setAttribute('aria-expanded', 'false');
				}
			});
			document.addEventListener('keydown', function (e) {
				if (e.key === 'Escape' && nav.classList.contains('is-open')) {
					nav.classList.remove('is-open');
					toggle.setAttribute('aria-expanded', 'false');
					toggle.focus();
				}
			});
		}

		/* ---- Scroll reveal ---- */
		var reveals = document.querySelectorAll('[data-reveal]');
		if (reveals.length) {
			if (!('IntersectionObserver' in window)) {
				reveals.forEach(function (el) { el.classList.add('is-visible'); });
			} else {
				var io = new IntersectionObserver(function (entries) {
					entries.forEach(function (entry) {
						if (entry.isIntersecting) {
							entry.target.classList.add('is-visible');
							io.unobserve(entry.target);
						}
					});
				}, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
				reveals.forEach(function (el) { io.observe(el); });
			}
		}

		/* ---- Copy link button ---- */
		document.querySelectorAll('.copy-link-btn').forEach(function (btn) {
			btn.addEventListener('click', function () {
				var url = btn.getAttribute('data-url');
				navigator.clipboard.writeText(url).then(function () {
					var original = btn.innerHTML;
					btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg> Copied!';
					btn.classList.add('copy-ok');
					setTimeout(function () { btn.innerHTML = original; btn.classList.remove('copy-ok'); }, 2000);
				});
			});
		});

		/* ---- Forms: progressive-enhancement AJAX submit ---- */
		document.querySelectorAll('form.form[data-ajax="true"]').forEach(function (form) {
			form.addEventListener('submit', function (e) {
				// Honeypot: if filled, silently drop (likely a bot).
				var hp = form.querySelector('input[name="company_website"]');
				if (hp && hp.value) { e.preventDefault(); return; }

				var action = form.getAttribute('action');
				if (!action || action === '#') { return; } // let it post normally / no-op

				e.preventDefault();
				var status = form.querySelector('.form__status');
				var submitBtn = form.querySelector('button[type="submit"]');
				var original = submitBtn ? submitBtn.innerHTML : '';
				var successUrl = form.getAttribute('data-success') || '/thanks/';

				if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = 'Sending…'; }
				if (status) { status.hidden = true; status.className = 'form__status'; }
				// Clear any previous field errors
				form.querySelectorAll('.field__error').forEach(function (el) { el.remove(); });
				form.querySelectorAll('[aria-invalid]').forEach(function (el) { el.removeAttribute('aria-invalid'); });

				fetch(action, {
					method: 'POST',
					body: new FormData(form),
					headers: { Accept: 'application/json' }
				})
					.then(function (res) {
						if (res.ok) {
							window.location.href = successUrl;
							return;
						}
						// Try to parse Formspree error JSON for field-level messages
						return res.json().then(function (data) {
							var errors = [];
							// Formspree wraps field errors in data.errors
							if (data && data.errors) {
								data.errors.forEach(function (err) {
									var msg = err.message || err.code || '';
									var field = err.field || '';
									if (field) {
										// Show error under the specific field
										var input = form.querySelector('[name="' + field + '"]');
										if (input) {
											input.setAttribute('aria-invalid', 'true');
											var errEl = document.createElement('span');
											errEl.className = 'field__error';
											errEl.textContent = msg;
											input.parentNode.appendChild(errEl);
										}
										errors.push(field + ': ' + msg);
									} else {
										errors.push(msg);
									}
								});
							}
							throw new Error(errors.length ? errors.join('\n') : 'Submission failed (' + res.status + '). Please try again.');
						}).catch(function (parseErr) {
							// If JSON parsing failed, throw the parse error
							if (parseErr instanceof SyntaxError) {
								throw new Error('Submission failed (' + res.status + '). Please try again.');
							}
							throw parseErr;
						});
					})
					.catch(function (err) {
						if (status) {
							status.textContent = err.message || 'Something went wrong. Please try again.';
							status.classList.add('is-error');
							status.hidden = false;
						}
					})
					.finally(function () {
						if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = original; }
					});
			});
		});
	});
})();
