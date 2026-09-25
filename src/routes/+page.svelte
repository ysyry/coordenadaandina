<script lang="ts">
	import { page } from '$app/state';

	const ANIOS = ['1º', '2º', '3º', '4º', '5º'];

	let p = $state(0);

	/* Bosque andino: coihues de copa ancha, cipreses angostos y alerces en capas.
	   Nada de pinos: acá no crecen solos. */
	const ARBOLES = [
		{ x: 24,   h: 44, t: 'coihue' },  { x: 58,  h: 60, t: 'cipres' },
		{ x: 92,   h: 38, t: 'alerce' },  { x: 128, h: 52, t: 'coihue' },
		{ x: 166,  h: 34, t: 'cipres' },  { x: 200, h: 46, t: 'coihue' },
		{ x: 1006, h: 50, t: 'coihue' },  { x: 1042, h: 36, t: 'alerce' },
		{ x: 1078, h: 58, t: 'cipres' },  { x: 1116, h: 42, t: 'coihue' },
		{ x: 1156, h: 48, t: 'alerce' }
	];

	/* Lo que flota detrás de la cortina: palabras del área y del territorio,
	   y los signos con los que se escribe cada disciplina. */
	const FLOTAN = [
		{ t: 'territorio',   x: 8,  y: 22, d: 0,   dur: 19, tipo: 'palabra' },
		{ t: 'función',      x: 74, y: 16, d: 2.5, dur: 23, tipo: 'palabra' },
		{ t: 'algoritmo',    x: 61, y: 68, d: 1.2, dur: 21, tipo: 'palabra' },
		{ t: 'cuatrimestre', x: 18, y: 74, d: 3.4, dur: 25, tipo: 'palabra' },
		{ t: 'nudo',         x: 44, y: 12, d: 4.1, dur: 18, tipo: 'palabra' },
		{ t: 'bosque',       x: 87, y: 52, d: 0.8, dur: 22, tipo: 'palabra' },
		{ t: 'dato',         x: 31, y: 44, d: 5.2, dur: 20, tipo: 'palabra' },
		{ t: 'cooperar',     x: 68, y: 36, d: 2.1, dur: 24, tipo: 'palabra' },
		{ t: '∑',  x: 13, y: 40, d: 0.5, dur: 16, tipo: 'mat' },
		{ t: 'π',  x: 27, y: 18, d: 3.0, dur: 20, tipo: 'mat' },
		{ t: '√',  x: 52, y: 78, d: 1.7, dur: 17, tipo: 'mat' },
		{ t: '∞',  x: 81, y: 28, d: 4.6, dur: 21, tipo: 'mat' },
		{ t: '∫',  x: 38, y: 60, d: 2.8, dur: 19, tipo: 'mat' },
		{ t: '&lt;/&gt;', x: 22, y: 58, d: 1.1, dur: 18, tipo: 'inf' },
		{ t: '{ }',   x: 71, y: 82, d: 3.7, dur: 22, tipo: 'inf' },
		{ t: '01',    x: 57, y: 30, d: 0.3, dur: 16, tipo: 'inf' },
		{ t: 'if →',  x: 90, y: 70, d: 2.4, dur: 23, tipo: 'inf' },
		{ t: '( )',   x: 46, y: 90, d: 4.9, dur: 20, tipo: 'inf' }
	];

	function alScrollear() {
		const alto = window.innerHeight * 1.3;
		p = Math.min(1, Math.max(0, window.scrollY / alto));
	}
	const suave = $derived(p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
</script>

<svelte:head><title>Areal · Matemática e Informática</title></svelte:head>
<svelte:window onscroll={alScrollear} />

<section class="portada">
	<div class="fijo">
		<div class="detras">
			<div class="escena" aria-hidden="true">
				<svg viewBox="0 0 1200 520" preserveAspectRatio="xMidYMax slice">
					<defs>
						<linearGradient id="cielo" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" class="c0a" /><stop offset="100%" class="c0b" />
						</linearGradient>
						<linearGradient id="agua" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" class="cAa" /><stop offset="100%" class="cAb" />
						</linearGradient>
					</defs>

					<rect width="1200" height="520" fill="url(#cielo)" />
					<circle class="sol" cx="935" cy="118" r="46" />

					<g class="nubes">
						<path class="nube" d="M120 96c0-17 14-30 31-30 7 0 13 2 18 6 6-14 20-24 36-24 20 0 37 14 41 33 3-1 6-2 10-2 15 0 27 12 27 27s-12 27-27 27H151c-17 0-31-14-31-31z" />
						<path class="nube n2" d="M690 64c0-13 11-23 24-23 5 0 10 1 14 4 5-11 15-18 28-18 15 0 28 11 31 25 2-1 5-1 7-1 11 0 21 9 21 21s-10 21-21 21H714c-13 0-24-10-24-23z" />
					</g>

					<path class="m1" d="M0 300 L120 214 L196 262 L318 158 L428 268 L520 210 L640 300 L760 224 L880 292 L1000 206 L1110 268 L1200 222 L1200 340 L0 340 Z" />
					<path class="nieve" d="M318 158 L296 188 L308 192 L322 182 L336 196 L352 186 Z M1000 206 L982 232 L994 236 L1006 226 L1018 238 L1030 230 Z" />
					<path class="m2" d="M0 348 L96 286 L210 344 L300 272 L420 350 L540 296 L664 356 L790 290 L900 352 L1030 294 L1140 348 L1200 314 L1200 400 L0 400 Z" />
					<path class="m3" d="M0 392 L140 350 L280 396 L420 352 L560 400 L700 356 L840 402 L980 358 L1120 400 L1200 376 L1200 434 L0 434 Z" />

					<path class="lago" d="M0 434 L1200 434 L1200 520 L0 520 Z" fill="url(#agua)" />
					<g class="reflejo">
						<path d="M0 452 L1200 452" /><path d="M120 470 L520 470" />
						<path d="M700 470 L1140 470" /><path d="M240 490 L860 490" />
					</g>

					<g class="bosque">
						{#each ARBOLES as a}
							<rect class="tronco" x={a.x - 1.7} y={434 - a.h * 0.5} width="3.4" height={a.h * 0.5} />
							{#if a.t === 'cipres'}
								<ellipse cx={a.x} cy={434 - a.h * 0.64} rx={a.h * 0.17} ry={a.h * 0.42} />
								<ellipse cx={a.x} cy={434 - a.h * 0.95} rx={a.h * 0.1} ry={a.h * 0.19} />
							{:else if a.t === 'alerce'}
								<ellipse cx={a.x} cy={434 - a.h * 0.52} rx={a.h * 0.31} ry={a.h * 0.15} />
								<ellipse cx={a.x} cy={434 - a.h * 0.72} rx={a.h * 0.24} ry={a.h * 0.13} />
								<ellipse cx={a.x} cy={434 - a.h * 0.9} rx={a.h * 0.15} ry={a.h * 0.12} />
							{:else}
								<ellipse cx={a.x - a.h * 0.15} cy={434 - a.h * 0.62} rx={a.h * 0.27} ry={a.h * 0.23} />
								<ellipse cx={a.x + a.h * 0.17} cy={434 - a.h * 0.68} rx={a.h * 0.25} ry={a.h * 0.21} />
								<ellipse cx={a.x} cy={434 - a.h * 0.84} rx={a.h * 0.23} ry={a.h * 0.19} />
							{/if}
						{/each}
					</g>

					<g class="aves">
						<path d="M520 132 q9 -8 18 0 q9 -8 18 0" />
						<path d="M566 112 q7 -6 14 0 q7 -6 14 0" />
					</g>
				</svg>
			</div>

			<div class="flotan" aria-hidden="true">
				{#each FLOTAN as f}
					<span class="f {f.tipo}"
						style="left:{f.x}%;top:{f.y}%;animation-delay:-{f.d}s;animation-duration:{f.dur}s">
						{@html f.t}
					</span>
				{/each}
			</div>

			<div class="tira">
				{#each ANIOS as a, i}
					{#if i}<span class="sep"></span>{/if}
					<div class="ta">
						<span class="num">{a}</span>
						<span class="et">{i < 3 ? 'Básico' : 'Orientado'}</span>
					</div>
				{/each}
			</div>
		</div>
		{#each ['arr', 'aba'] as lado}
			<div class="mitad {lado}"
				style="transform:translateY({(lado === 'arr' ? -100 : 100) * suave}%)">
				<div class="lienzo">
					<p class="supra">Provincia del Neuquén · Villa La Angostura</p>
					<h1>Matemática <em>e</em> Informática</h1>
					<p class="bajada">Plataforma de gestión del área, construida desde el territorio
						neuquino: situada, cooperativa y en desarrollo.</p>
				</div>
			</div>
		{/each}
		<div class="bajar" style="opacity:{Math.max(0, 1 - p * 3.2)}">
			<span>Bajá para abrir</span><b>↓</b>
		</div>
	</div>
</section>

{#if page.data.usuario}
	<section class="empezar">
		<div class="emp-in">
			<p class="rot">Por dónde empezar</p>
			<ol>
				<li><a href="/perfil">Marcá qué materias das</a> — de ahí sale lo que te toca en el resto.</li>
				<li><a href="/formularios">Contestá Bases del área</a> — se guarda solo, se puede cerrar y volver.</li>
				<li><a href="/calendario">Mirá el calendario</a> — cuántas clases quedan y qué días se pierden.</li>
			</ol>
		</div>
	</section>
{/if}

<section class="manifiesto">
	<div class="man-in">
		<p class="rot">Qué es esto</p>
		<p class="grande">
			Plataforma de soporte para la <b>organización y planificación del área de Matemática e
			Informática</b>, desarrollada de manera situada y con espíritu cooperativo en la
			<b>provincia del Neuquén</b>.
		</p>
		<p class="chica">
			Reúne el diseño curricular de la jurisdicción —los nudos disciplinares, los
			conocimientos y saberes de cada cuatrimestre y los vínculos entre las dos
			disciplinas— para poder verlo completo y de un año al otro, y planificar a partir
			de ahí.
		</p>
	</div>
</section>

<style>
	/* ── La escena: cerros, lago y bosque, detrás de la cortina ── */
	.escena{position:absolute;inset:0;overflow:hidden}
	.escena svg{width:100%;height:100%;display:block}
	.c0a{stop-color:#D9E4F2} .c0b{stop-color:#F2ECF5}
	.cAa{stop-color:#A8C4DE} .cAb{stop-color:#7FA3C4}
	.sol{fill:#F6E7C9}
	.nube{fill:#FBFAFD;opacity:.9;animation:deriva 90s linear infinite}
	.nube.n2{animation-duration:130s;opacity:.75}
	.m1{fill:#8E9ABF} .nieve{fill:#F4F2FA}
	.m2{fill:#6E7BA6} .m3{fill:#55618A}
	.reflejo path{stroke:#FFFFFF;stroke-opacity:.35;stroke-width:2;stroke-linecap:round}
	.bosque ellipse{fill:#3E4A72} .bosque .tronco{fill:#33406A}
	.aves path{fill:none;stroke:#4A4A5E;stroke-width:2.4;stroke-linecap:round;opacity:.55}
	@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .c0a{stop-color:#14122A}
		:root:not([data-theme="light"]) .c0b{stop-color:#241E3C}
		:root:not([data-theme="light"]) .cAa{stop-color:#1C2745}
		:root:not([data-theme="light"]) .cAb{stop-color:#121A31}
		:root:not([data-theme="light"]) .sol{fill:#E8DFA8;opacity:.5}
		:root:not([data-theme="light"]) .nube{fill:#2E2846;opacity:.55}
		:root:not([data-theme="light"]) .m1{fill:#3A3560} :root:not([data-theme="light"]) .nieve{fill:#6A6494}
		:root:not([data-theme="light"]) .m2{fill:#2C2850} :root:not([data-theme="light"]) .m3{fill:#211E3E}
		:root:not([data-theme="light"]) .bosque ellipse,:root:not([data-theme="light"]) .bosque .tronco{fill:#191735}
		:root:not([data-theme="light"]) .reflejo path{stroke:#B197EE;stroke-opacity:.22}
		:root:not([data-theme="light"]) .aves path{stroke:#9A93C4}}
	:root[data-theme="dark"] .c0a{stop-color:#14122A} :root[data-theme="dark"] .c0b{stop-color:#241E3C}
	:root[data-theme="dark"] .cAa{stop-color:#1C2745} :root[data-theme="dark"] .cAb{stop-color:#121A31}
	:root[data-theme="dark"] .sol{fill:#E8DFA8;opacity:.5}
	:root[data-theme="dark"] .nube{fill:#2E2846;opacity:.55}
	:root[data-theme="dark"] .m1{fill:#3A3560} :root[data-theme="dark"] .nieve{fill:#6A6494}
	:root[data-theme="dark"] .m2{fill:#2C2850} :root[data-theme="dark"] .m3{fill:#211E3E}
	:root[data-theme="dark"] .bosque ellipse,:root[data-theme="dark"] .bosque .tronco{fill:#191735}
	:root[data-theme="dark"] .reflejo path{stroke:#B197EE;stroke-opacity:.22}
	:root[data-theme="dark"] .aves path{stroke:#9A93C4}

	/* ── Lo que flota ── */
	.flotan{position:absolute;inset:0;pointer-events:none}
	.f{position:absolute;animation-name:flotar;animation-timing-function:ease-in-out;
		animation-iteration-count:infinite;will-change:transform}
	.f.palabra{font-family:"Bricolage Grotesque",Georgia,serif;font-weight:600;
		font-size:clamp(13px,1.5vw,20px);color:var(--violeta);opacity:.32}
	.f.mat{font-family:"DM Mono",monospace;font-size:clamp(18px,2.4vw,34px);
		color:var(--mat);opacity:.34}
	.f.inf{font-family:"DM Mono",monospace;font-size:clamp(14px,1.8vw,24px);
		color:var(--inf);opacity:.34}
	@keyframes flotar{
		0%{transform:translate3d(0,0,0)}
		50%{transform:translate3d(10px,-22px,0)}
		100%{transform:translate3d(0,0,0)}
	}
	@keyframes deriva{from{transform:translateX(-140px)}to{transform:translateX(1340px)}}
	@media (prefers-reduced-motion:reduce){
		.f,.nube{animation:none}
	}

	/* ── La cortina ── */
	.portada{height:230vh;position:relative}
	.fijo{position:sticky;top:58px;height:calc(100vh - 58px);overflow:hidden}
	.detras{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
		background:var(--papel)}
	.tira{display:flex;gap:clamp(14px,3vw,44px);align-items:center;padding:0 24px;flex-wrap:wrap;
		justify-content:center}
	.ta{text-align:center}
	.num{font-family:"Bricolage Grotesque",serif;font-weight:800;font-size:clamp(2.4rem,6vw,5rem);
		line-height:.9;color:var(--violeta);font-variation-settings:"wdth" 80;display:block}
	.et{font-family:"DM Mono",monospace;font-size:clamp(9px,1vw,11px);letter-spacing:.16em;
		text-transform:uppercase;color:var(--tenue);margin-top:8px;display:block}
	.sep{width:1px;height:56px;background:var(--raya2)}
	.mitad{position:absolute;left:0;width:100%;height:50%;overflow:hidden;background:var(--papel);
		will-change:transform;z-index:2}
	.mitad.arr{top:0;border-bottom:1px solid var(--violeta)}
	.mitad.aba{top:50%;border-top:1px solid var(--violeta)}
	.lienzo{position:absolute;left:0;width:100%;height:calc(100vh - 58px);display:flex;
		flex-direction:column;align-items:center;justify-content:center;
		padding:0 clamp(20px,5vw,70px);text-align:center}
	.mitad.arr .lienzo{top:0}
	.mitad.aba .lienzo{top:calc(-50vh + 29px)}
	.supra{font-family:"DM Mono",monospace;font-size:clamp(10px,1.1vw,13px);letter-spacing:.24em;
		text-transform:uppercase;color:var(--tenue);margin:0 0 clamp(16px,3vh,34px)}
	h1{font-family:"Bricolage Grotesque",Georgia,serif;font-weight:800;
		font-size:clamp(2.6rem,10vw,9rem);line-height:.86;letter-spacing:-.045em;color:var(--tinta);
		margin:0;font-variation-settings:"wdth" 82;max-width:12ch}
	h1 em{font-style:normal;color:var(--violeta)}
	.bajada{font-size:clamp(15px,1.5vw,19px);color:var(--texto);max-width:52ch;
		margin:clamp(18px,3.4vh,38px) auto 0;line-height:1.5}
	.bajar{position:absolute;bottom:26px;left:50%;transform:translateX(-50%);z-index:6;
		font-family:"DM Mono",monospace;font-size:12.5px;letter-spacing:.16em;text-transform:uppercase;
		color:var(--tenue);display:flex;flex-direction:column;align-items:center;gap:7px}
	.bajar b{font-weight:400;font-size:19px;line-height:1;animation:late 1.9s ease-in-out infinite}
	@keyframes late{0%,100%{transform:translateY(0);opacity:.55}50%{transform:translateY(5px);opacity:1}}

	/* ── Primeros pasos, sólo con sesión ── */
	.empezar{position:relative;z-index:3;background:var(--papel);border-top:1px solid var(--raya2)}
	.emp-in{max-width:840px;margin:0 auto;padding:34px 30px}
	.emp-in .rot{font-family:"DM Mono",monospace;font-size:12px;letter-spacing:.18em;
		text-transform:uppercase;color:var(--violeta);margin:0 0 14px}
	.emp-in ol{margin:0;padding-left:1.2em;display:flex;flex-direction:column;gap:9px}
	.emp-in li{font-size:16px;line-height:1.5;color:var(--texto)}
	.emp-in a{color:var(--tinta);font-weight:600}

	/* ── Manifiesto ── */
	.manifiesto{position:relative;z-index:3;border-top:1px solid var(--raya2);background:var(--hoja)}
	.man-in{max-width:840px;margin:0 auto;padding:60px 30px 72px}
	.man-in .rot{font-family:"DM Mono",monospace;font-size:12px;letter-spacing:.18em;
		text-transform:uppercase;color:var(--violeta);margin:0 0 16px}
	.grande{font-family:"Bricolage Grotesque",Georgia,serif;font-weight:600;
		font-size:clamp(1.25rem,2.6vw,1.75rem);line-height:1.35;color:var(--tinta);
		margin:0;letter-spacing:-.015em}
	.grande b{font-weight:800}
	.chica{font-size:16.5px;color:var(--texto);margin:20px 0 0;max-width:64ch}

	@media (prefers-reduced-motion:reduce){
		.portada{height:auto}
		.fijo{position:static;height:auto}
		.mitad{position:static;height:auto;transform:none!important;border:none}
		.mitad.aba{display:none}
		.lienzo{position:static;height:auto;padding:70px 24px}
		.detras{position:static;padding:40px 0;border-top:1px solid var(--raya)}
		.bajar{display:none}
		*{animation:none!important}
	}
</style>
