<script lang="ts">
	let { data } = $props();

	/* ── Geometría del mapa ───────────────────────────────────────────
	   Todo se calcula, nada se mide: la grilla es regular, así que los
	   hilos se dibujan con aritmética y no dependen del DOM. */
	const ROTULO = 320;   // ancho de la columna de nombres
	const COL = 84;       // ancho de un cuatrimestre
	const CN = 10;        // cuatrimestres del diseño, 1º a 5º
	const W = ROTULO + COL * CN;
	const CABEZA = 84;    // las tres bandas de arriba
	const FILA = 34;
	const TITULO_G = 26;
	const HUECO_G = 18;
	const MW = 58, MH = 19;   // el bloque que marca "acá se dicta"

	const colX = (c: number) => ROTULO + (c - 1) * COL;
	const colCx = (c: number) => colX(c) + COL / 2;

	const CICLOS = [
		{ desde: 1, hasta: 4, rot: 'Ciclo Básico Común' },
		{ desde: 5, hasta: 6, rot: 'Enlace Interciclo' },
		{ desde: 7, hasta: 10, rot: 'Ciclo Orientado' }
	];
	const ANIOS = [1, 2, 3, 4, 5].map((a) => ({ desde: a * 2 - 1, hasta: a * 2, rot: a + 'º' }));
	const GRUPOS = [
		{ key: 'matematica', cls: 'm', rot: 'Matemática' },
		{ key: 'informatica', cls: 'i', rot: 'Informática' },
		{ key: 'epa', cls: 'e', rot: 'EPA · sólo Ciclo Orientado' }
	];

	const corto = (s: string) => (s.length <= 32 ? s : s.slice(0, 31).replace(/[\s,]+\S*$/, '') + '…');

	const secciones = $derived(
		GRUPOS.map((g) => ({ ...g, pistas: data.pistas.filter((p) => p.disciplina === g.key) })).filter(
			(g) => g.pistas.length
		)
	);

	const trazado = $derived.by(() => {
		let y = CABEZA;
		const bandas: { cls: string; rot: string; tituloY: number; desde: number; hasta: number }[] = [];
		const filas: { p: (typeof data.pistas)[number]; cls: string; cy: number }[] = [];
		for (const g of secciones) {
			const tituloY = y + 16;
			y += TITULO_G;
			const desde = y;
			for (const p of g.pistas) {
				filas.push({ p, cls: g.cls, cy: y + FILA / 2 });
				y += FILA;
			}
			bandas.push({ cls: g.cls, rot: g.rot, tituloY, desde, hasta: y });
			y += HUECO_G;
		}
		return { filas, bandas, alto: y - HUECO_G + 14 };
	});

	const yDe = $derived(new Map(trazado.filas.map((f) => [f.p.codigo, f.cy])));

	/* Los hilos se arquean para no pisarse: el primero de cada cuatrimestre
	   sale por la derecha, el segundo por la izquierda. */
	const hilos = $derived.by(() => {
		const usados = new Map<number, number>();
		return data.hilos.map((h, k) => {
			const n = usados.get(h.c) ?? 0;
			usados.set(h.c, n + 1);
			const dir = n % 2 === 0 ? 1 : -1;
			const arco = 28 + Math.floor(n / 2) * 12;
			const x = colCx(h.c);
			const y1 = yDe.get(h.a) ?? CABEZA;
			const y2 = yDe.get(h.b) ?? CABEZA;
			return {
				...h,
				k,
				escrito: !!h.falsoAmigo,
				x,
				d: `M ${x} ${y1 + MH / 2} C ${x + dir * arco} ${y1 + 30} ${x + dir * arco} ${y2 - 30} ${x} ${y2 - MH / 2}`
			};
		});
	});

	let foco = $state<number | null>(null);
	let sel = $state<{ t: 'nudo'; codigo: string; c: number } | { t: 'hilo'; k: number } | null>(null);

	const apagado = (c: number) => foco !== null && foco !== c;
	const enHilo = (codigo: string, c: number) =>
		sel?.t === 'hilo' && hilos[sel.k].c === c && (hilos[sel.k].a === codigo || hilos[sel.k].b === codigo);

	const hiloSel = $derived(sel?.t === 'hilo' ? hilos[sel.k] : null);
	const nudoSel = $derived.by(() => {
		const q = sel;
		if (q?.t !== 'nudo') return null;
		const p = data.pistas.find((x) => x.codigo === q.codigo);
		const paso = p?.pasos.find((x) => x.c === q.c);
		return p && paso ? { p, paso } : null;
	});

	const cifras = $derived([
		{ n: data.pistas.filter((p) => p.pasos.some((x) => x.c <= 6)).length, rot: 'nudos · Ciclo Básico' },
		{
			n: data.pistas.filter(
				(p) => p.pasos.some((x) => x.c <= 6) && p.pasos.some((x) => x.c >= 7)
			).length,
			rot: 'siguen en 4º y 5º'
		},
		{ n: data.hilos.length, rot: 'hilos entre las dos' },
		{ n: data.hilos.filter((h) => h.falsoAmigo).length, rot: 'escritos en detalle' }
	]);

	function tocar(e: KeyboardEvent, f: () => void) {
		if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); f(); }
	}
</script>

<svelte:head><title>Areal · mapa del área</title></svelte:head>
<svelte:window onkeydown={(e) => e.key === 'Escape' && (sel = null)} />

<div class="encabezado">
	<div>
		<h1>Mapa del área</h1>
		<p class="sede">Dónde vive cada nudo y dónde las dos disciplinas se tocan</p>
	</div>
	<div class="cifras">
		{#each cifras as c}
			<div><b>{c.n}</b><span>{c.rot}</span></div>
		{/each}
	</div>
</div>

<main>
	<div class="lienzo">
		<svg width={W} height={trazado.alto} viewBox="0 0 {W} {trazado.alto}" role="img"
			aria-label="Mapa de nudos por cuatrimestre y sus cruces">

			<!-- bandas de ciclo y año -->
			{#each CICLOS as b}
				<rect class="banda" x={colX(b.desde)} y="0" width={(b.hasta - b.desde + 1) * COL - 3} height="22" />
				<text class="rotBanda" x={colX(b.desde) + 9} y="15">{b.rot}</text>
			{/each}
			{#each ANIOS as a}
				<text class="rotAnio" x={colX(a.desde) + COL - 3} y="45">{a.rot} año</text>
				<line class="raya" x1={colX(a.desde)} y1="52" x2={colX(a.hasta) + COL - 3} y2="52" />
			{/each}

			<!-- encabezados de cuatrimestre, tocables -->
			{#each Array(CN) as _, j}
				{@const c = j + 1}
				<g role="button" tabindex="0" class="colhead" class:apagado={apagado(c)}
					aria-pressed={foco === c}
					onclick={() => (foco = foco === c ? null : c)}
					onkeydown={(e) => tocar(e, () => (foco = foco === c ? null : c))}>
					<rect x={colX(c)} y="58" width={COL - 3} height="22" rx="3"
						class="chip" class:on={foco === c} />
					<text class="rotCuatri" class:on={foco === c} x={colCx(c) - 1.5} y="73">C{c}</text>
				</g>
			{/each}

			<!-- guías -->
			{#each trazado.filas as f}
				<line class="guia" class:selg={sel?.t === 'nudo' && sel.codigo === f.p.codigo}
					x1={ROTULO} y1={f.cy} x2={W - 3} y2={f.cy} />
			{/each}
			<line class="corte" x1={colX(7) - 1.5} y1="26" x2={colX(7) - 1.5} y2={trazado.alto - 14} />

			<!-- títulos de disciplina -->
			{#each trazado.bandas as b}
				<text class="rotGrupo {b.cls}" x="0" y={b.tituloY}>{b.rot}</text>
				<line class="reglaGrupo {b.cls}" x1="0" y1={b.tituloY + 7} x2={W - 3} y2={b.tituloY + 7} />
			{/each}

			<!-- hilos, por debajo de los bloques -->
			{#each hilos as h}
				<g role="button" tabindex="0" class="hilo" class:apagado={apagado(h.c)}
					class:on={sel?.t === 'hilo' && sel.k === h.k}
					onclick={() => (sel = { t: 'hilo', k: h.k })}
					onkeydown={(e) => tocar(e, () => (sel = { t: 'hilo', k: h.k }))}>
					<title>{h.a} × {h.b} · {h.titulo}</title>
					<path class="golpe" d={h.d} />
					<path class="linea" class:punteado={!h.escrito} d={h.d} />
					<circle class="nodo" cx={h.x} cy={(yDe.get(h.a) ?? 0) + MH / 2} r="2.6" />
					<circle class="nodo" cx={h.x} cy={(yDe.get(h.b) ?? 0) - MH / 2} r="2.6" />
				</g>
			{/each}

			<!-- bloques: acá se dicta este nudo -->
			{#each trazado.filas as f}
				{#each f.p.pasos as paso}
					<g role="button" tabindex="0" class="marca {f.cls}"
						class:apagado={apagado(paso.c)}
						class:on={sel?.t === 'nudo' && sel.codigo === f.p.codigo && sel.c === paso.c}
						class:cruza={enHilo(f.p.codigo, paso.c)}
						onclick={() => (sel = { t: 'nudo', codigo: f.p.codigo, c: paso.c })}
						onkeydown={(e) => tocar(e, () => (sel = { t: 'nudo', codigo: f.p.codigo, c: paso.c }))}>
						<title>{f.p.codigo} · C{paso.c} · {paso.titulo ?? f.p.nombre}</title>
						<rect class="caja" class:repite={paso.repite}
							x={colCx(paso.c) - MW / 2} y={f.cy - MH / 2} width={MW} height={MH} rx="3" />
					</g>
				{/each}
			{/each}

			<!-- nombres -->
			{#each trazado.filas as f}
				<g class="rotulo {f.cls}">
					<title>{f.p.nombre}</title>
					<rect class="cod" x="0" y={f.cy - 9} width="62" height="18" rx="2" />
					<text class="codt" x="31" y={f.cy + 4}>{f.p.codigo}</text>
					<text class="nom" class:transv={f.p.transversal} x="72" y={f.cy + 4.5}>{corto(f.p.nombre)}</text>
				</g>
			{/each}
		</svg>
	</div>

	<div class="leyenda">
		<span><i class="ej caja m"></i> se dicta</span>
		<span><i class="ej caja m rep"></i> repite el texto anterior</span>
		<span><i class="ej hi"></i> cruce escrito</span>
		<span><i class="ej hi pun"></i> cruce por escribir</span>
		<span class="pista">tocá un bloque, un hilo o un cuatrimestre</span>
	</div>

	{#if hiloSel}
		<section class="ficha hilo">
			<header>
				<code>{hiloSel.a} × {hiloSel.b}</code>
				<h2>{hiloSel.titulo}</h2>
				<span class="donde">C{hiloSel.c} · {hiloSel.resumen}</span>
				<button type="button" onclick={() => (sel = null)} aria-label="Cerrar">✕</button>
			</header>

			{#if hiloSel.idiomaA || hiloSel.idiomaB}
				<div class="cara">
					<div class="lado m">
						<h3>En Matemática se dice</h3>
						<p>{hiloSel.idiomaA}</p>
						{#if hiloSel.claseA}<p class="clase"><b>En clase:</b> {hiloSel.claseA}</p>{/if}
						{#if hiloSel.vocabA}<p class="vocab"><b>Palabras prestadas de Informática:</b> {hiloSel.vocabA}</p>{/if}
					</div>
					<div class="lado i">
						<h3>En Informática se dice</h3>
						<p>{hiloSel.idiomaB}</p>
						{#if hiloSel.claseB}<p class="clase"><b>En clase:</b> {hiloSel.claseB}</p>{/if}
						{#if hiloSel.vocabB}<p class="vocab"><b>Palabras prestadas de Matemática:</b> {hiloSel.vocabB}</p>{/if}
					</div>
				</div>
			{/if}

			{#if hiloSel.trampa}
				<div class="trampa">
					<span class="et">Donde se traban</span>
					<code>{hiloSel.trampa}</code>
					{#if hiloSel.falsoAmigo}<p>{hiloSel.falsoAmigo}</p>{/if}
				</div>
			{/if}

			{#if hiloSel.pregunta}
				<div class="pregunta">
					<span class="et">La pregunta que necesita a las dos</span>
					<b>{hiloSel.pregunta}</b>
					{#if hiloSel.porQue}<p>{hiloSel.porQue}</p>{/if}
				</div>
			{/if}

			{#if !hiloSel.idiomaA && !hiloSel.trampa}
				<p class="falta">Este cruce está señalado pero todavía no está escrito.</p>
			{/if}
		</section>
	{:else if nudoSel}
		<section class="ficha nudo {nudoSel.p.disciplina === 'matematica' ? 'm' : nudoSel.p.disciplina === 'informatica' ? 'i' : 'e'}">
			<header>
				<code>{nudoSel.p.codigo}</code>
				<h2>{nudoSel.paso.titulo ?? nudoSel.p.nombre}</h2>
				<span class="donde">
					C{nudoSel.paso.c} · {nudoSel.paso.anio}º año · {nudoSel.paso.nombre} · {nudoSel.paso.resolucion}
				</span>
				<button type="button" onclick={() => (sel = null)} aria-label="Cerrar">✕</button>
			</header>
			{#if nudoSel.paso.repite}
				<p class="falta">La resolución repite acá, palabra por palabra, el texto del cuatrimestre anterior.</p>
			{/if}
			<p class="saberes">{nudoSel.paso.saberes}</p>
			<div class="tira">
				{#each nudoSel.p.pasos as x}
					<button type="button" class:on={x.c === nudoSel.paso.c}
						onclick={() => (sel = { t: 'nudo', codigo: nudoSel.p.codigo, c: x.c })}>
						C{x.c} <i>{x.anio}º</i>
					</button>
				{/each}
			</div>
		</section>
	{:else}
		<section class="indice">
			<h2>Los {data.hilos.length} hilos</h2>
			<div class="tarjetas">
				{#each hilos as h}
					<button type="button" class="tarjeta" class:vacia={!h.escrito} onclick={() => (sel = { t: 'hilo', k: h.k })}>
						<span class="cuando">C{h.c}</span>
						<code>{h.a} × {h.b}</code>
						<b>{h.titulo}</b>
						<span class="res">{h.resumen}</span>
					</button>
				{/each}
			</div>
		</section>
	{/if}
</main>

<style>
	.encabezado{display:flex;align-items:center;gap:24px;flex-wrap:wrap;
		padding:26px 30px 20px;border-bottom:1px solid var(--raya2)}
	.encabezado h1{font-family:"Bricolage Grotesque",Georgia,serif;font-weight:700;font-size:1.6rem;
		color:var(--tinta);margin:0;letter-spacing:-.02em;font-variation-settings:"wdth" 88}
	.sede{font-size:15.5px;color:var(--tenue);margin:4px 0 0}
	.cifras{display:flex;gap:28px;margin-left:auto;flex-wrap:wrap}
	.cifras div{display:flex;flex-direction:column;line-height:1.05}
	.cifras b{font-family:"Bricolage Grotesque",Georgia,serif;font-size:1.9rem;font-weight:700;
		color:var(--violeta);letter-spacing:-.03em}
	.cifras span{font-family:"DM Mono",monospace;font-size:11.5px;letter-spacing:.09em;
		text-transform:uppercase;color:var(--tenue);margin-top:4px}

	main{padding:24px 30px 40px;max-width:1400px;margin:0 auto}
	.lienzo{overflow-x:auto;background:var(--hoja);border:1px solid var(--raya);
		box-shadow:var(--sombra);padding:16px 18px}
	svg{display:block}

	/* ── bandas y encabezados ── */
	.banda{fill:var(--franja)}
	.rotBanda{font-family:"DM Mono",monospace;font-size:11.5px;letter-spacing:.11em;
		text-transform:uppercase;fill:var(--tenue)}
	.rotAnio{font-family:"Bricolage Grotesque",Georgia,serif;font-size:14px;font-weight:600;
		fill:var(--tinta);text-anchor:end;letter-spacing:-.01em}
	.raya{stroke:var(--raya2);stroke-width:1}
	.colhead{cursor:pointer}
	.chip{fill:var(--hoja);stroke:var(--raya2);stroke-width:1}
	.colhead:hover .chip{fill:var(--violeta-w)}
	.chip.on{fill:var(--violeta);stroke:var(--violeta)}
	.rotCuatri{font-family:"DM Mono",monospace;font-size:13px;font-weight:500;
		fill:var(--tenue);text-anchor:middle}
	.rotCuatri.on{fill:var(--hoja)}
	.colhead:focus-visible{outline:2px solid var(--violeta);outline-offset:2px}

	.guia{stroke:var(--raya);stroke-width:1}
	.guia.selg{stroke:var(--violeta);stroke-width:1.4;opacity:.55}
	.corte{stroke:var(--raya2);stroke-width:1;stroke-dasharray:2 4}

	.rotGrupo{font-family:"DM Mono",monospace;font-size:12px;letter-spacing:.15em;
		text-transform:uppercase;font-weight:500}
	.rotGrupo.m{fill:var(--mat)} .rotGrupo.i{fill:var(--inf)} .rotGrupo.e{fill:var(--epa)}
	.reglaGrupo{stroke-width:1.6}
	.reglaGrupo.m{stroke:var(--mat)} .reglaGrupo.i{stroke:var(--inf)} .reglaGrupo.e{stroke:var(--epa)}

	/* ── rótulos de nudo ── */
	.cod{fill:var(--franja)}
	.rotulo.m .cod{fill:var(--mat-w)} .rotulo.i .cod{fill:var(--inf-w)} .rotulo.e .cod{fill:var(--epa-w)}
	.codt{font-family:"DM Mono",monospace;font-size:11.5px;font-weight:500;text-anchor:middle}
	.rotulo.m .codt{fill:var(--mat)} .rotulo.i .codt{fill:var(--inf)} .rotulo.e .codt{fill:var(--epa)}
	.nom{font-size:14px;fill:var(--tinta)}
	.nom.transv{font-style:italic}

	/* ── bloques ── */
	.marca{cursor:pointer}
	.caja{stroke-width:1.2}
	.marca.m .caja{fill:var(--mat);stroke:var(--mat)}
	.marca.i .caja{fill:var(--inf);stroke:var(--inf)}
	.marca.e .caja{fill:var(--epa);stroke:var(--epa)}
	.caja.repite{fill-opacity:.2}
	.marca:hover .caja{stroke-width:2.6}
	.marca.on .caja{stroke:var(--tinta);stroke-width:2.6}
	.marca.cruza .caja{stroke:var(--epa);stroke-width:2.6}
	.marca.apagado{opacity:.18}
	.marca:focus-visible .caja{stroke:var(--violeta);stroke-width:2.6}

	/* ── hilos ── */
	.hilo{cursor:pointer}
	.golpe{fill:none;stroke:transparent;stroke-width:14}
	.linea{fill:none;stroke:var(--epa);stroke-width:2}
	.linea.punteado{stroke-width:1.4;stroke-dasharray:3 4;opacity:.6}
	.nodo{fill:var(--epa)}
	.hilo:hover .linea{stroke-width:3.4;opacity:1}
	.hilo.on .linea{stroke-width:3.6;opacity:1;stroke-dasharray:none}
	.hilo.apagado{opacity:.15}
	.hilo:focus-visible .linea{stroke:var(--violeta);stroke-width:3.4}

	.leyenda{display:flex;gap:20px;flex-wrap:wrap;align-items:center;
		font-family:"DM Mono",monospace;font-size:12px;letter-spacing:.06em;
		color:var(--tenue);padding:12px 2px 0}
	.leyenda span{display:flex;align-items:center;gap:7px}
	.ej{display:inline-block;width:22px;height:11px}
	.ej.caja.m{background:var(--mat)}
	.ej.caja.m.rep{background:var(--mat-w);border:1px solid var(--mat)}
	.ej.hi{height:0;border-top:2px solid var(--epa)}
	.ej.hi.pun{border-top-style:dashed;border-top-width:1.5px}
	.leyenda .pista{margin-left:auto;color:var(--pale)}

	/* ── fichas ── */
	.ficha{margin-top:20px;background:var(--hoja);border:1px solid var(--raya);
		border-top:3px solid var(--epa);box-shadow:var(--sombra);padding:20px 22px 22px}
	.ficha.nudo{border-top-color:var(--violeta)}
	.ficha.nudo.m{border-top-color:var(--mat)}
	.ficha.nudo.i{border-top-color:var(--inf)}
	.ficha.nudo.e{border-top-color:var(--epa)}
	.ficha header{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;margin-bottom:14px}
	.ficha header code{font-family:"DM Mono",monospace;font-size:13px;font-weight:500;
		color:var(--tinta);background:var(--franja);padding:3px 7px}
	.ficha h2{font-family:"Bricolage Grotesque",Georgia,serif;font-weight:700;font-size:1.32rem;
		color:var(--tinta);margin:0;letter-spacing:-.02em}
	.ficha .donde{font-family:"DM Mono",monospace;font-size:12px;letter-spacing:.08em;
		text-transform:uppercase;color:var(--tenue)}
	.ficha header button{margin-left:auto;background:none;border:1px solid var(--raya2);
		cursor:pointer;padding:3px 9px;color:var(--tenue);line-height:1.2}
	.ficha header button:hover{color:var(--tinta);border-color:var(--tinta)}

	.cara{display:grid;grid-template-columns:1fr 1fr;gap:0;border:1px solid var(--raya)}
	@media(max-width:900px){.cara{grid-template-columns:1fr}}
	.lado{padding:16px 18px}
	.lado.m{background:var(--mat-w);border-right:1px solid var(--raya)}
	.lado.i{background:var(--inf-w)}
	.lado h3{font-family:"DM Mono",monospace;font-size:12px;letter-spacing:.13em;
		text-transform:uppercase;margin:0 0 9px;font-weight:500}
	.lado.m h3{color:var(--mat)} .lado.i h3{color:var(--inf)}
	.lado p{margin:0 0 9px;font-size:15.5px;line-height:1.55}
	.lado p:last-child{margin-bottom:0}
	.lado .clase,.lado .vocab{font-size:14.5px;color:var(--tenue)}
	.lado b{color:var(--tinta);font-weight:600}

	.trampa{margin-top:16px;border:1px solid var(--raya2);padding:15px 18px}
	.trampa code{display:block;font-family:"DM Mono",monospace;font-size:15px;color:var(--tinta);
		background:var(--franja);padding:11px 14px;margin:8px 0 11px;overflow-x:auto}
	.trampa p{margin:0;font-size:15.5px;line-height:1.55;white-space:pre-line}
	.et{font-family:"DM Mono",monospace;font-size:11.5px;letter-spacing:.13em;
		text-transform:uppercase;color:var(--tenue)}

	.pregunta{margin-top:14px;border-left:3px solid var(--epa);background:var(--epa-w);padding:13px 16px}
	.pregunta b{display:block;font-family:"Bricolage Grotesque",Georgia,serif;font-size:1.1rem;
		color:var(--tinta);margin:5px 0 7px;letter-spacing:-.01em}
	.pregunta p{margin:0;font-size:15px;line-height:1.55}

	.saberes{margin:0;font-size:15px;line-height:1.6}
	.falta{font-family:"DM Mono",monospace;font-size:13px;color:var(--tenue);
		border-left:2px solid var(--raya2);padding-left:10px;margin:0 0 12px}
	.tira{display:flex;gap:0;border:1px solid var(--raya2);margin-top:16px;width:fit-content}
	.tira button{background:var(--hoja);border:none;border-right:1px solid var(--raya2);cursor:pointer;
		font-family:"DM Mono",monospace;font-size:13.5px;padding:7px 11px;color:var(--tenue)}
	.tira button:last-child{border-right:none}
	.tira button:hover{background:var(--violeta-w);color:var(--tinta)}
	.tira button.on{background:var(--violeta);color:var(--hoja)}
	.tira i{font-style:normal;opacity:.6;font-size:11.5px}

	.indice{margin-top:20px}
	.indice h2{font-family:"DM Mono",monospace;font-size:12.5px;letter-spacing:.15em;
		text-transform:uppercase;color:var(--tenue);margin:0 0 12px;font-weight:500}
	.tarjetas{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px}
	.tarjeta{display:flex;flex-direction:column;align-items:flex-start;gap:3px;text-align:left;
		background:var(--hoja);border:1px solid var(--raya);border-left:3px solid var(--epa);
		padding:12px 14px;cursor:pointer;box-shadow:var(--sombra)}
	.tarjeta:hover{border-left-width:6px;padding-left:11px}
	.tarjeta.vacia{border-left-style:dashed;opacity:.72}
	.tarjeta .cuando{font-family:"DM Mono",monospace;font-size:11.5px;letter-spacing:.1em;
		color:var(--epa)}
	.tarjeta code{font-family:"DM Mono",monospace;font-size:12px;color:var(--tenue)}
	.tarjeta b{font-family:"Bricolage Grotesque",Georgia,serif;font-size:1.02rem;font-weight:600;
		color:var(--tinta);letter-spacing:-.01em;line-height:1.25}
	.tarjeta .res{font-size:14px;color:var(--tenue);line-height:1.4}
	.tarjeta:focus-visible{outline:2px solid var(--violeta);outline-offset:2px}
</style>
