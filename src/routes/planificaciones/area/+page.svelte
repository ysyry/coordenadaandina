<script lang="ts">
	import { enhance } from '$app/forms';
	import { PERSPECTIVAS, VINCULOS_AREA, OBJETIVOS_AREA, EVALUACION } from '$lib/marco';
	let { data } = $props();

	const CICLOS = [
		{ id: 'basico', rot: 'Ciclo Básico e Interciclo', pie: '1.º a 3.º' },
		{ id: 'orientado', rot: 'Ciclo Orientado', pie: '4.º y 5.º' }
	];

	const escritos = $derived(data.componentes.filter((c) => !c.fuera && c.contenido.trim()).length);
	const total = $derived(data.componentes.filter((c) => !c.fuera).length);

	const mat = $derived([...new Set(data.catalogo.filter((c) => c.disciplina === 'matematica').map((c) => c.codigo))]);
	const inf = $derived([...new Set(data.catalogo.filter((c) => c.disciplina === 'informatica').map((c) => c.codigo))]);
	const epa = $derived([...new Set(data.catalogo.filter((c) => c.disciplina === 'epa').map((c) => c.codigo))]);
	const nombreDe = (cod: string) => data.catalogo.find((c) => c.codigo === cod)?.nombre ?? cod;

	let abierto = $state<number | null>(null);
</script>

<svelte:head><title>Areal · la planificación del área</title></svelte:head>

<div class="encabezado">
	<div>
		<p class="miga"><a href="/planificaciones">Planificaciones</a> · del área</p>
		<h1>Planificación Curricular de Área</h1>
		<p class="sede">
			Res. 1381/22 · se elabora <b>por ciclo, no por año</b> ·
			es un documento público, para compartir con las familias y con la comunidad
		</p>
	</div>
	<nav class="ciclos" aria-label="Ciclo">
		{#each CICLOS as c}
			<a href="?ciclo={c.id}" aria-current={data.ciclo === c.id ? 'page' : undefined}>
				{c.rot}<i>{c.pie}</i>
			</a>
		{/each}
	</nav>
</div>

<main>
	<section class="avance">
		<div class="cuenta">
			<b>{escritos}</b><span>de {total} componentes escritos</span>
		</div>
		<div class="barra">
			{#each data.componentes as c}
				<span class="cel" class:lleno={!c.fuera && c.contenido.trim()} class:fuera={c.fuera}
					title="{c.n}. {c.rot}">{c.n}</span>
			{/each}
		</div>
		<form method="POST" action="?/guardarPlan" use:enhance class="estado">
			<input type="hidden" name="planId" value={data.plan.id} />
			{#each ['borrador', 'revision', 'presentada'] as e}
				<button type="submit" name="estado" value={e} aria-pressed={data.plan.estado === e}>{e}</button>
			{/each}
		</form>
	</section>

	<!-- ── la Situación Inicial Grupal: no es componente, es documento propio ── -->
	<form class="sig" method="POST" action="?/guardarPlan" use:enhance>
		<input type="hidden" name="planId" value={data.plan.id} />
		<h2>Situación Inicial Grupal</h2>
		<p class="ayuda">
			No es uno de los ocho componentes: es un documento aparte. <b>Reemplaza al diagnóstico
			áulico</b>, que el diseño cuestiona por dejar al grupo cargando rótulos que circulan por
			la escuela. La escribe el conjunto de docentes del área al inicio de 1.º, tomando el
			ciclo como unidad pedagógica, y se revisa año a año.
		</p>
		<textarea name="situacionInicial" rows="7"
			placeholder="Quiénes son este grupo, de dónde vienen, qué trae el ciclo. Escrita entre todas, en plural.">{data.plan.situacionInicial}</textarea>
		<button type="submit" class="guardar">Guardar</button>
	</form>

	<!-- ── los ocho componentes ── -->
	<h2 class="titulo">Los ocho componentes</h2>

	{#each data.componentes as c}
		<article class="comp" class:vacio={!c.contenido.trim()} class:fuera={c.fuera}>
			<header>
				<span class="nro">{c.n}</span>
				<div>
					<h3>{c.rot}</h3>
					<p>{c.ayuda}</p>
				</div>
				{#if c.fuera}
					<span class="sello">fuera de Areal</span>
				{:else if c.auto === 'catalogo'}
					<span class="sello auto">del catálogo</span>
				{:else if c.contenido.trim()}
					<span class="sello ok">escrito</span>
				{/if}
				{#if !c.fuera}
					<button type="button" class="abrir" onclick={() => (abierto = abierto === c.n ? null : c.n)}>
						{abierto === c.n ? 'Cerrar' : c.contenido.trim() ? 'Editar' : 'Escribir'}
					</button>
				{/if}
			</header>

			{#if c.n === 2 && abierto !== 2}
				<div class="cat">
					<div><span class="et m">Matemática</span>{#each mat as k}<code title={nombreDe(k)}>{k}</code>{/each}</div>
					<div><span class="et i">Informática</span>{#each inf as k}<code title={nombreDe(k)}>{k}</code>{/each}</div>
					{#if epa.length}<div><span class="et e">EPA</span>{#each epa as k}<code title={nombreDe(k)}>{k}</code>{/each}</div>{/if}
					<p class="nota">
						Los nudos disciplinares ya están: los fija la resolución. Lo que hay que acordar
						son <b>los núcleos problemáticos del área</b> — el nivel por encima del nudo, lo
						que el área entera problematiza. Es lo que condiciona todo lo demás.
					</p>
				</div>
			{:else if c.n === 3 && abierto !== 3}
				<div class="cat">
					<p class="nota">
						{data.catalogo.length} filas nudo×cuatrimestre transcriptas de la resolución, en
						<a href="/programa">El programa</a>. No se escribe: se cita.
					</p>
				</div>
			{:else if abierto !== c.n && c.contenido.trim()}
				<div class="texto">{c.contenido}</div>
			{/if}

			{#if abierto === c.n}
				<form class="editor" method="POST" action="?/guardarComponente"
					use:enhance={() => async ({ update }) => { await update({ reset: false }); abierto = null; }}>
					<input type="hidden" name="planId" value={data.plan.id} />
					<input type="hidden" name="numero" value={c.n} />

					{#if c.n === 1}
						<p class="pista">Qué entiende esta área por su objeto de conocimiento. Los cuatro vínculos
						de área son el material: {VINCULOS_AREA.map((v) => v.rot.toLowerCase()).join(' · ')}.</p>
					{:else if c.n === 2}
						<p class="pista">Escribí acá <b>los núcleos problemáticos del área</b>. Los nudos ya están
						en el catálogo. Las cinco Perspectivas se reflejan en cada núcleo:
						{PERSPECTIVAS.map((p) => p.rot).join(' · ')}.</p>
					{:else if c.n === 4}
						<p class="pista">Propósitos, no objetivos: se enuncian desde el compromiso del profesorado
						—qué se va a favorecer— y no desde lo que el estudiantado desarrolla. Los objetivos de
						aprendizaje ya los fija la norma: {OBJETIVOS_AREA.length} para el área.</p>
					{:else if c.n === 5}
						<p class="pista">El cómo. La resolución pide pasar de explicación-aplicación a
						problematización-conceptualización. Sobre evaluar: «{EVALUACION.intro}»</p>
					{:else if c.n === 7}
						<p class="pista">Reuniones periódicas, seguimiento, trabajo interárea y co-formación.
						Lo que ya está acordado se ve en <a href="/reuniones">Reuniones</a>.</p>
					{:else if c.n === 8}
						<p class="pista">Los nudos secuenciados en el tiempo, el EPA y los formatos. Lo que cada
						materia va a hacer está en <a href="/planificaciones">las planificaciones por materia</a>.</p>
					{/if}

					<textarea name="contenido" rows="12" placeholder={c.ayuda}>{c.contenido}</textarea>
					<button type="submit" class="guardar">Guardar componente {c.n}</button>
				</form>
			{/if}
		</article>
	{/each}
</main>

<style>
	.encabezado{display:flex;align-items:flex-end;gap:24px;flex-wrap:wrap;
		padding:22px 30px 18px;border-bottom:1px solid var(--raya2);border-top:4px solid var(--violeta)}
	.miga{font-family:"DM Mono",monospace;font-size:12px;letter-spacing:.09em;
		text-transform:uppercase;color:var(--tenue);margin:0 0 5px}
	.miga a{color:var(--violeta);text-decoration:none}
	.miga a:hover{text-decoration:underline}
	.encabezado h1{font-family:"Bricolage Grotesque",Georgia,serif;font-weight:700;font-size:1.7rem;
		color:var(--tinta);margin:0;letter-spacing:-.02em;font-variation-settings:"wdth" 88}
	.sede{font-size:15px;color:var(--tenue);margin:5px 0 0;max-width:70ch}
	.sede b{color:var(--tinta)}
	.ciclos{display:flex;border:1px solid var(--raya2);margin-left:auto}
	.ciclos a{display:flex;flex-direction:column;gap:2px;text-decoration:none;background:var(--hoja);
		border-right:1px solid var(--raya2);padding:9px 15px;color:var(--tenue);
		font-family:"DM Mono",monospace;font-size:12.5px}
	.ciclos a:last-child{border-right:none}
	.ciclos a:hover{background:var(--violeta-w);color:var(--tinta)}
	.ciclos a[aria-current="page"]{background:var(--violeta);color:var(--hoja)}
	.ciclos i{font-style:normal;font-size:10px;opacity:.7}

	main{padding:24px 30px 44px;max-width:1000px;margin:0 auto}

	.avance{display:flex;align-items:center;gap:26px;flex-wrap:wrap;background:var(--hoja);
		border:1px solid var(--raya);padding:16px 20px;box-shadow:var(--sombra)}
	.cuenta{display:flex;align-items:baseline;gap:9px}
	.cuenta b{font-family:"Bricolage Grotesque",Georgia,serif;font-size:2rem;font-weight:700;
		color:var(--violeta);letter-spacing:-.03em}
	.cuenta span{font-family:"DM Mono",monospace;font-size:11.5px;letter-spacing:.07em;
		text-transform:uppercase;color:var(--tenue)}
	.barra{display:flex;gap:4px}
	.cel{width:28px;height:28px;display:grid;place-items:center;border:1px solid var(--raya2);
		font-family:"DM Mono",monospace;font-size:12px;color:var(--pale)}
	.cel.lleno{background:var(--violeta);border-color:var(--violeta);color:var(--hoja)}
	.cel.fuera{border-style:dashed;opacity:.5}
	.estado{display:flex;border:1px solid var(--raya2);margin-left:auto}
	.estado button{background:var(--hoja);border:none;border-right:1px solid var(--raya2);cursor:pointer;
		font-family:"DM Mono",monospace;font-size:11px;letter-spacing:.08em;text-transform:uppercase;
		padding:8px 12px;color:var(--tenue)}
	.estado button:last-child{border-right:none}
	.estado button:hover{background:var(--violeta-w);color:var(--tinta)}
	.estado button[aria-pressed="true"]{background:var(--violeta);color:var(--hoja)}

	.sig{margin-top:20px;background:var(--hoja);border:1px solid var(--raya);
		border-left:3px solid var(--epa);padding:18px 20px;box-shadow:var(--sombra);
		display:flex;flex-direction:column;gap:11px}
	h2{font-family:"Bricolage Grotesque",Georgia,serif;font-weight:600;font-size:1.25rem;
		color:var(--tinta);margin:0;letter-spacing:-.02em}
	.titulo{margin:30px 0 14px}
	.ayuda{margin:0;font-size:15px;color:var(--texto)}
	.ayuda b{color:var(--tinta)}

	.comp{background:var(--hoja);border:1px solid var(--raya);margin-bottom:10px;
		box-shadow:var(--sombra)}
	.comp.fuera{opacity:.6}
	.comp header{display:grid;grid-template-columns:auto 1fr auto auto;gap:14px;
		align-items:start;padding:15px 18px}
	.nro{font-family:"Bricolage Grotesque",Georgia,serif;font-size:1.5rem;font-weight:700;
		color:var(--pale);line-height:1;letter-spacing:-.03em;width:26px}
	.comp.vacio .nro{color:var(--raya2)}
	.comp h3{font-family:"Bricolage Grotesque",Georgia,serif;font-weight:600;font-size:1.1rem;
		color:var(--tinta);margin:0;letter-spacing:-.01em}
	.comp header p{margin:4px 0 0;font-size:14.5px;color:var(--tenue)}
	.sello{font-family:"DM Mono",monospace;font-size:10.5px;letter-spacing:.09em;
		text-transform:uppercase;border:1px solid var(--raya2);color:var(--tenue);padding:3px 8px;
		white-space:nowrap;align-self:center}
	.sello.ok{border-color:var(--violeta);color:var(--violeta)}
	.sello.auto{border-color:var(--mat);color:var(--mat)}
	.abrir{background:none;border:1px solid var(--raya2);color:var(--tenue);cursor:pointer;
		font-family:"DM Mono",monospace;font-size:11.5px;padding:5px 11px;align-self:center}
	.abrir:hover{color:var(--tinta);border-color:var(--tinta)}

	.texto{padding:0 18px 16px 58px;font-size:15px;white-space:pre-line;line-height:1.6}
	.cat{padding:0 18px 16px 58px}
	.cat div{display:flex;gap:5px;flex-wrap:wrap;align-items:center;margin-bottom:7px}
	.et{font-family:"DM Mono",monospace;font-size:10.5px;letter-spacing:.11em;text-transform:uppercase;
		width:96px}
	.et.m{color:var(--mat)} .et.i{color:var(--inf)} .et.e{color:var(--epa)}
	.cat code{font-family:"DM Mono",monospace;font-size:11px;background:var(--franja);
		padding:2px 7px;color:var(--tinta)}
	.nota{margin:10px 0 0;font-size:14.5px;color:var(--tenue)}
	.nota b{color:var(--tinta)}
	.nota a{color:var(--violeta)}

	.editor{padding:4px 18px 18px 58px;display:flex;flex-direction:column;gap:11px}
	.pista{margin:0;font-size:14px;color:var(--tenue);border-left:2px solid var(--epa);
		padding-left:12px}
	.pista b{color:var(--tinta)}
	.pista a{color:var(--violeta)}
	textarea{font-family:Manrope,sans-serif;font-size:15.5px;color:var(--tinta);background:var(--papel);
		border:1px solid var(--raya2);padding:11px 13px;width:100%;resize:vertical;line-height:1.6}
	textarea:focus{outline:2px solid var(--violeta);outline-offset:-1px}
	.guardar{background:var(--violeta);border:1px solid var(--violeta);color:var(--hoja);cursor:pointer;
		font-family:"DM Mono",monospace;font-size:11.5px;letter-spacing:.09em;text-transform:uppercase;
		padding:8px 16px;align-self:flex-start}
	.guardar:hover{opacity:.88}
</style>
