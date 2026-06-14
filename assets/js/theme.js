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

				if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = 'Sending…'; }
				if (status) { status.hidden = true; status.className = 'form__status'; }

				fetch(action, {
					method: 'POST',
					body: new FormData(form),
					headers: { Accept: 'application/json' }
				})
					.then(function (res) {
						if (res.ok) {
							form.reset();
							if (status) {
								status.textContent = form.getAttribute('data-msg-ok') ||
									'Thanks — your message is in. We’ll be in touch shortly.';
								status.classList.add('is-ok');
								status.hidden = false;
							}
						} else {
							throw new Error('Bad response ' + res.status);
						}
					})
					.catch(function () {
						if (status) {
							status.textContent = 'Something went wrong. Please email us directly and we’ll sort it out.';
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
