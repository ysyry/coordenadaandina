<script lang="ts">
	import { enhance } from '$app/forms';
	import { mitadDe } from '$lib/clases';
	import {
		OBJETIVOS_AREA, OBJETIVOS_AREA_NOTA, OBJETIVOS_DISCIPLINA, OBJETIVOS_VS_PROPOSITOS,
		EVALUACION, VINCULOS_AREA, VINCULOS_FILTRO, PERSPECTIVAS, PERSPECTIVAS_DONDE, ENFOQUE
	} from '$lib/marco';
	let { data } = $props();

	/* Los criterios se editan con estado propio para poder ofrecer los cinco
	   objetivos del área como punto de partida: la norma ya los fija, no hay
	   que inventar criterios compartidos. */
	let criterios = $state('');
	$effect(() => { criterios = data.plan.criterios; });
	const enfoque = $derived(ENFOQUE[data.plan.disciplina]);
	const objetivosPropios = $derived(OBJETIVOS_DISCIPLINA[data.plan.disciplina] ?? []);

	function traerObjetivos() {
		const texto = OBJETIVOS_AREA.map((o) => `${o.n}. ${o.texto}\n   Se mira: ${o.mira}`).join('\n\n');
		criterios = criterios.trim() ? criterios.trim() + '\n\n' + texto : texto;
	}

	const cls = $derived(
		data.plan.disciplina === 'matematica' ? 'm' : data.plan.disciplina === 'informatica' ? 'i' : 'e'
	);
	const DIAS = ['', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes'];

	const total = $derived(data.unidades.reduce((a, u) => a + u.clases, 0));
	const base = $derived(Math.max(total, data.clases.hay, 1));
	const corte = $derived((data.clases.hay / base) * 100);
	const sobran = $derived(data.clases.hay - total);

	const porNudo = $derived(new Map(data.catalogo.map((n) => [n.id, n])));
	const cubiertos = $derived(new Set(data.unidades.flatMap((u) => u.nudos)));
	const mat = $derived(data.catalogo.filter((n) => n.disciplina === 'matematica'));
	const inf = $derived(data.catalogo.filter((n) => n.disciplina === 'informatica'));
	const epaN = $derived(data.catalogo.filter((n) => n.disciplina === 'epa'));

	/** Una unidad que toca nudos de las dos disciplinas es, por definición, un EPA. */
	const esEpa = (nudos: string[]) => {
		const d = new Set(nudos.map((n) => porNudo.get(n)?.disciplina).filter(Boolean));
		return d.has('matematica') && d.has('informatica');
	};

	let abierta = $state<string | null>(null);
	let nueva = $state(false);
</script>

<svelte:head><title>Areal · {data.curso.etiqueta} · {data.plan.espacio}</title></svelte:head>

<div class="encabezado {cls}">
	<div>
		<p class="miga"><a href="/planificaciones">Planificaciones</a> · {data.curso.etiqueta}</p>
		<h1>{data.plan.espacio}</h1>
		<p class="sede">
			{data.docentes.join(' · ')} ·
			C{data.plan.cuatrimestre} · {mitadDe(data.plan.cuatrimestre) === 1 ? 'primer' : 'segundo'} cuatrimestre ·
			{data.clases.tramo.desde.split('-').reverse().join('/')} al
			{data.clases.tramo.hasta.split('-').reverse().join('/')}
		</p>
	</div>
	<form method="POST" action="?/guardarPlan" use:enhance class="estado">
		<input type="hidden" name="proposito" value={data.plan.proposito} />
		<input type="hidden" name="criterios" value={data.plan.criterios} />
		<input type="hidden" name="acreditacion" value={data.plan.acreditacion} />
		<input type="hidden" name="notas" value={data.plan.notas} />
		{#each ['borrador', 'en curso', 'cerrado'] as e}
			<button type="submit" name="estado" value={e} aria-pressed={data.plan.estado === e}>{e}</button>
		{/each}
	</form>
</div>

<main>
	<!-- ── la cinta: cuántas clases hay y en qué se van ── -->
	<section class="cinta">
		<div class="marco">
			<div class="tira" style="--corte:{corte}%">
				{#each data.unidades as u, i}
					{#if u.clases > 0}
						<div class="seg {cls}" style="width:{(u.clases / base) * 100}%;--i:{i}"
							title="{u.titulo} · {u.clases} clases">
							<span>{u.clases}</span>
						</div>
					{/if}
				{/each}
				{#if sobran > 0}
					<div class="seg libre" style="width:{(sobran / base) * 100}%"><span>{sobran}</span></div>
				{/if}
			</div>
			<div class="regla"><span style="left:{corte}%">{data.clases.hay} clases</span></div>
		</div>
		<div class="cuentas">
			<div><b>{data.clases.hay}</b><span>clases reales</span></div>
			<div><b class:mal={total > data.clases.hay}>{total}</b><span>planificadas</span></div>
			<div><b>{data.clases.perdidas}</b><span>caen en feriado o jornada</span></div>
			<div><b>{data.encuentros}</b><span>encuentros por semana</span></div>
		</div>
		{#if total > data.clases.hay}
			<p class="alerta">Te pasás por {total - data.clases.hay} clases. O achicás una unidad, o algo queda afuera.</p>
		{:else if sobran > 0 && data.unidades.length}
			<p class="ok">Quedan {sobran} clases sin asignar.</p>
		{/if}
	</section>

	<!-- ── qué del programa oficial queda cubierto ── -->
	<section class="cobertura">
		<h2>Del programa oficial de C{data.plan.cuatrimestre}</h2>
		<div class="grupos">
			{#each [{ rot: 'Matemática', k: 'm', ns: mat }, { rot: 'Informática', k: 'i', ns: inf }, { rot: 'EPA', k: 'e', ns: epaN }] as g}
				{#if g.ns.length}
					<div class="grupo {g.k}">
						<h3>{g.rot}</h3>
						<div class="chips">
							{#each g.ns as n}
								<span class="chip" class:on={cubiertos.has(n.id)} title={n.titulo ?? n.nombre}>
									{n.codigo}
								</span>
							{/each}
						</div>
					</div>
				{/if}
			{/each}
		</div>
		<p class="pie">Lleno = alguna unidad lo toma. Vacío = está prescripto y todavía no lo agarra nadie.</p>
	</section>

	<!-- ── el encuadre prescripto: no cambia, pero hay que tenerlo a la vista ── -->
	<section class="encuadre">
		<h2>El encuadre, según la Res. 1463/18</h2>
		<div class="acordeon">
			<details>
				<summary>Los cuatro vínculos de área <i>los que hacen que esto sea un área</i></summary>
				<div class="cuerpo">
					{#each VINCULOS_AREA as v}
						<div class="vinc">
							<span class="nro">{v.n}</span>
							<div><b>{v.rot}</b><em>{v.resumen}</em><p>{v.texto}</p></div>
						</div>
					{/each}
					<p class="filtro">{VINCULOS_FILTRO}</p>
				</div>
			</details>
			<details>
				<summary>Las cinco Perspectivas <i>atraviesan todos los nudos</i></summary>
				<div class="cuerpo">
					{#each PERSPECTIVAS as p}
						<div class="persp"><b>{p.rot}</b> <em>{p.pie}</em><p>{p.texto}</p></div>
					{/each}
					<p class="filtro">{PERSPECTIVAS_DONDE}</p>
				</div>
			</details>
			<details>
				<summary>Cómo hay que enseñar {data.plan.disciplina === 'matematica' ? 'Matemática' : 'Informática'} <i>el enfoque prescripto</i></summary>
				<div class="cuerpo">
					<p>{enfoque.intro}</p>
					<ul>{#each enfoque.puntos as pt}<li>{pt}</li>{/each}</ul>
				</div>
			</details>
			<details>
				<summary>Los saberes prescriptos de C{data.plan.cuatrimestre} <i>el texto de la resolución</i></summary>
				<div class="cuerpo">
					{#each data.catalogo as n}
						<div class="saber">
							<code>{n.codigo}</code>
							<div><b>{n.titulo ?? n.nombre}</b><p>{n.saberes}</p></div>
						</div>
					{/each}
				</div>
			</details>
		</div>
	</section>

	<!-- ── las unidades ── -->
	<section class="unidades">
		<div class="tituloU">
			<h2>Lo que se va a dar</h2>
			<button type="button" class="agregar" onclick={() => (nueva = !nueva)}>
				{nueva ? 'Cancelar' : '+ Unidad'}
			</button>
		</div>

		{#if nueva}
			<form class="editor" method="POST" action="?/nuevaUnidad"
				use:enhance={() => async ({ update }) => { await update(); nueva = false; }}>
				<div class="dos">
					<label>Título<input name="titulo" required placeholder="Del sensor al dato" /></label>
					<label>Clases<input name="clases" type="number" min="0" value="4" /></label>
				</div>
				<label>Qué se busca ver
					<textarea name="busca" rows="2" placeholder="Que puedan leer un sensor y explicar qué mide"></textarea>
				</label>
				<fieldset>
					<legend>Nudos que cubre</legend>
					{#each data.catalogo as n}
						<label class="tick"><input type="checkbox" name="nudo" value={n.id} />
							<code>{n.codigo}</code> {n.titulo ?? n.nombre}</label>
					{/each}
				</fieldset>
				<button type="submit" class="guardar">Agregar</button>
			</form>
		{/if}

		{#each data.unidades as u, i}
			{@const epa = esEpa(u.nudos)}
			<article class="unidad" class:abierta={abierta === u.id}>
				<header>
					<span class="orden">{i + 1}</span>
					<div class="cabeza">
						<h3>{u.titulo}</h3>
						{#if u.busca}<p>{u.busca}</p>{/if}
						<div class="tags">
							{#each u.nudos as id}
								{@const n = porNudo.get(id)}
								{#if n}<code class={n.disciplina === 'matematica' ? 'm' : n.disciplina === 'informatica' ? 'i' : 'e'}>{n.codigo}</code>{/if}
							{/each}
							{#if epa}<span class="esepa">toca las dos · es un EPA</span>{/if}
							{#if u.epaId}
								<a class="esepa link" href="/epa/{u.epaId}">ficha del EPA →</a>
							{/if}
						</div>
					</div>
					<span class="clases"><b>{u.clases}</b> clases</span>
					<div class="mandos">
						<form method="POST" action="?/mover" use:enhance>
							<input type="hidden" name="id" value={u.id} />
							<button type="submit" name="dir" value="-1" disabled={i === 0} aria-label="Subir">↑</button>
							<button type="submit" name="dir" value="1" disabled={i === data.unidades.length - 1} aria-label="Bajar">↓</button>
						</form>
						<button type="button" onclick={() => (abierta = abierta === u.id ? null : u.id)}>
							{abierta === u.id ? 'Cerrar' : 'Editar'}
						</button>
					</div>
				</header>

				{#if abierta === u.id}
					<form class="editor" method="POST" action="?/guardarUnidad"
						use:enhance={() => async ({ update }) => { await update({ reset: false }); abierta = null; }}>
						<input type="hidden" name="id" value={u.id} />
						<div class="dos">
							<label>Título<input name="titulo" value={u.titulo} required /></label>
							<label>Clases<input name="clases" type="number" min="0" value={u.clases} /></label>
						</div>
						<label>Qué se busca ver<textarea name="busca" rows="2">{u.busca}</textarea></label>
						<div class="dos">
							<label>Producto<input name="producto" value={u.producto} placeholder="Qué queda hecho" /></label>
							<label>Si es un EPA ya declarado
								<select name="epaId">
									<option value="">—</option>
									{#each data.epas as e}
										<option value={e.id} selected={u.epaId === e.id}>{e.nombre}</option>
									{/each}
								</select>
							</label>
						</div>
						<label>Criterios de evaluación de esta unidad
							<textarea name="criterios" rows="2">{u.criterios}</textarea>
						</label>
						<fieldset>
							<legend>Nudos que cubre</legend>
							{#each data.catalogo as n}
								<label class="tick"><input type="checkbox" name="nudo" value={n.id} checked={u.nudos.includes(n.id)} />
									<code>{n.codigo}</code> {n.titulo ?? n.nombre}</label>
							{/each}
						</fieldset>
						<div class="fila">
							<button type="submit" class="guardar">Guardar</button>
							<button type="submit" class="borrar" formaction="?/borrarUnidad">Borrar unidad</button>
						</div>
					</form>
				{:else if u.producto || u.criterios}
					<div class="extra">
						{#if u.producto}<p><b>Producto:</b> {u.producto}</p>{/if}
						{#if u.criterios}<p><b>Criterios:</b> {u.criterios}</p>{/if}
					</div>
				{/if}
			</article>
		{:else}
			{#if !nueva}<p class="vacio">Todavía no hay unidades. Empezá por la primera.</p>{/if}
		{/each}
	</section>

	<!-- ── lo que vale para todo el cuatrimestre ── -->
	<form class="marco2" method="POST" action="?/guardarPlan" use:enhance>
		<input type="hidden" name="estado" value={data.plan.estado} />
		<h2>Criterios de evaluación y acreditación</h2>
		<label>Propósito del cuatrimestre
			<textarea name="proposito" rows="2" placeholder="Qué se propone la materia en este tramo">{data.plan.proposito}</textarea>
		</label>
		<div class="prescripto">
			<h3>Los cinco objetivos del área, que ya son los criterios</h3>
			<p class="nota">{OBJETIVOS_AREA_NOTA}</p>
			<ol class="objs">
				{#each OBJETIVOS_AREA as o}
					<li><b>{o.texto}</b><span>Se mira: {o.mira}</span></li>
				{/each}
			</ol>
			<button type="button" class="traer" onclick={traerObjetivos}>Escribirlos abajo</button>
			<details>
				<summary>Los propios de {data.plan.disciplina === 'matematica' ? 'Matemática' : 'Informática'}</summary>
				<ul>{#each objetivosPropios as o}<li>{o}</li>{/each}</ul>
			</details>
			<details>
				<summary>Qué prescribe la norma sobre evaluar</summary>
				<p>{EVALUACION.intro}</p>
				<p><b>Lo que se observa:</b> {EVALUACION.observa.join(' · ')}.</p>
				<p>{EVALUACION.consecuencia}</p>
			</details>
			<p class="nota"><b>Ojo:</b> {OBJETIVOS_VS_PROPOSITOS}</p>
		</div>

		<label>Criterios de evaluación
			<textarea name="criterios" rows="8" bind:value={criterios}
				placeholder="Con qué se mira el trabajo. La escuela pide que se mantengan iguales durante todo el tramo."></textarea>
		</label>
		<label>Acreditación
			<textarea name="acreditacion" rows="3" placeholder="Qué hay que tener aprobado para acreditar el cuatrimestre">{data.plan.acreditacion}</textarea>
		</label>
		<label>Notas<textarea name="notas" rows="2">{data.plan.notas}</textarea></label>
		<button type="submit" class="guardar">Guardar</button>
	</form>
</main>

<style>
	.encabezado{display:flex;align-items:flex-end;gap:24px;flex-wrap:wrap;
		padding:22px 30px 18px;border-bottom:1px solid var(--raya2);border-top:4px solid}
	.encabezado.m{border-top-color:var(--mat)}
	.encabezado.i{border-top-color:var(--inf)}
	.encabezado.e{border-top-color:var(--epa)}
	.miga{font-family:"DM Mono",monospace;font-size:12px;letter-spacing:.09em;
		text-transform:uppercase;color:var(--tenue);margin:0 0 5px}
	.miga a{color:var(--violeta);text-decoration:none}
	.miga a:hover{text-decoration:underline}
	.encabezado h1{font-family:"Bricolage Grotesque",Georgia,serif;font-weight:700;font-size:1.7rem;
		color:var(--tinta);margin:0;letter-spacing:-.02em;font-variation-settings:"wdth" 88}
	.sede{font-size:15px;color:var(--tenue);margin:4px 0 0}
	.estado{display:flex;border:1px solid var(--raya2);margin-left:auto}
	.estado button{background:var(--hoja);border:none;border-right:1px solid var(--raya2);cursor:pointer;
		font-family:"DM Mono",monospace;font-size:12.5px;letter-spacing:.08em;text-transform:uppercase;
		padding:8px 12px;color:var(--tenue)}
	.estado button:last-child{border-right:none}
	.estado button:hover{background:var(--violeta-w);color:var(--tinta)}
	.estado button[aria-pressed="true"]{background:var(--violeta);color:var(--hoja)}

	main{padding:24px 30px 44px;max-width:1160px;margin:0 auto}
	h2{font-family:"DM Mono",monospace;font-size:12.5px;letter-spacing:.15em;text-transform:uppercase;
		color:var(--tenue);margin:0 0 12px;font-weight:500}

	/* ── cinta de clases ── */
	.cinta{background:var(--hoja);border:1px solid var(--raya);padding:18px 20px;
		box-shadow:var(--sombra)}
	.marco{position:relative;padding-bottom:22px}
	.tira{display:flex;height:34px;border:1px solid var(--raya2);background:var(--papel);
		position:relative}
	.tira::after{content:'';position:absolute;left:var(--corte);top:-5px;bottom:-5px;width:2px;
		background:var(--tinta)}
	.seg{display:flex;align-items:center;justify-content:center;overflow:hidden;
		border-right:1px solid var(--hoja);min-width:2px}
	.seg span{font-family:"DM Mono",monospace;font-size:12.5px;color:var(--hoja);font-weight:500}
	.seg.m{background:color-mix(in srgb, var(--mat) calc(92% - var(--i) * 9%), var(--pale))}
	.seg.i{background:color-mix(in srgb, var(--inf) calc(92% - var(--i) * 9%), var(--pale))}
	.seg.e{background:color-mix(in srgb, var(--epa) calc(92% - var(--i) * 9%), var(--pale))}
	.seg.libre{background:repeating-linear-gradient(45deg,var(--franja),var(--franja) 5px,var(--papel) 5px,var(--papel) 10px)}
	.seg.libre span{color:var(--tenue)}
	.regla{position:relative;height:16px}
	.regla span{position:absolute;transform:translateX(-50%);font-family:"DM Mono",monospace;
		font-size:12px;letter-spacing:.06em;color:var(--tinta);white-space:nowrap;top:2px}
	.cuentas{display:flex;gap:30px;flex-wrap:wrap;margin-top:6px}
	.cuentas div{display:flex;flex-direction:column;line-height:1.05}
	.cuentas b{font-family:"Bricolage Grotesque",Georgia,serif;font-size:1.5rem;font-weight:700;
		color:var(--tinta);letter-spacing:-.03em}
	.cuentas b.mal{color:var(--inf)}
	.cuentas span{font-family:"DM Mono",monospace;font-size:11px;letter-spacing:.09em;
		text-transform:uppercase;color:var(--tenue);margin-top:4px}
	.alerta,.ok{margin:14px 0 0;font-size:15px;padding:9px 13px;border-left:3px solid}
	.alerta{border-color:var(--inf);background:var(--inf-w);color:var(--tinta)}
	.ok{border-color:var(--raya2);color:var(--tenue)}

	/* ── cobertura ── */
	.cobertura{margin-top:20px;background:var(--hoja);border:1px solid var(--raya);
		padding:16px 20px 14px;box-shadow:var(--sombra)}
	.grupos{display:flex;gap:28px;flex-wrap:wrap}
	.grupo h3{font-family:"DM Mono",monospace;font-size:11.5px;letter-spacing:.13em;
		text-transform:uppercase;margin:0 0 7px;font-weight:500}
	.grupo.m h3{color:var(--mat)} .grupo.i h3{color:var(--inf)} .grupo.e h3{color:var(--epa)}
	.chips{display:flex;gap:5px;flex-wrap:wrap}
	.chip{font-family:"DM Mono",monospace;font-size:12px;padding:3px 7px;border:1px solid;
		color:var(--tenue);border-color:var(--raya2);background:none}
	.grupo.m .chip.on{background:var(--mat);border-color:var(--mat);color:var(--hoja)}
	.grupo.i .chip.on{background:var(--inf);border-color:var(--inf);color:var(--hoja)}
	.grupo.e .chip.on{background:var(--epa);border-color:var(--epa);color:var(--hoja)}
	.cobertura .pie{font-family:"DM Mono",monospace;font-size:11.5px;color:var(--pale);
		margin:12px 0 0;letter-spacing:.05em}

	/* ── encuadre ── */
	.encuadre{margin-top:20px}
	.acordeon{display:grid;gap:8px}
	.acordeon details{background:var(--hoja);border:1px solid var(--raya);box-shadow:var(--sombra)}
	.acordeon summary{cursor:pointer;padding:12px 16px;font-family:"Bricolage Grotesque",Georgia,serif;
		font-weight:600;font-size:1.02rem;color:var(--tinta);letter-spacing:-.01em}
	.acordeon summary i{font-style:normal;font-family:"DM Mono",monospace;font-size:11px;
		letter-spacing:.08em;text-transform:uppercase;color:var(--tenue);margin-left:9px}
	.acordeon summary:hover{background:var(--violeta-w)}
	.cuerpo{padding:4px 18px 18px;border-top:1px solid var(--raya)}
	.cuerpo p{font-size:15px;margin:9px 0}
	.cuerpo ul{margin:9px 0;padding-left:20px}
	.cuerpo li{font-size:15px;margin-bottom:7px}
	.vinc{display:grid;grid-template-columns:auto 1fr;gap:14px;padding:12px 0;
		border-bottom:1px solid var(--raya)}
	.vinc .nro{font-family:"Bricolage Grotesque",Georgia,serif;font-size:1.6rem;font-weight:700;
		color:var(--epa);line-height:1;letter-spacing:-.03em}
	.vinc b,.persp b{display:block;font-family:"Bricolage Grotesque",Georgia,serif;font-size:1.05rem;
		color:var(--tinta);letter-spacing:-.01em}
	.vinc em,.persp em{font-style:normal;font-family:"DM Mono",monospace;font-size:11.5px;
		letter-spacing:.05em;color:var(--tenue)}
	.vinc p,.persp p{margin:6px 0 0;font-size:14.5px}
	.persp{padding:11px 0;border-bottom:1px solid var(--raya)}
	.filtro{border-left:3px solid var(--epa);background:var(--epa-w);padding:10px 14px;
		font-size:14.5px;margin-top:14px}
	.saber{display:grid;grid-template-columns:66px 1fr;gap:12px;padding:11px 0;
		border-bottom:1px solid var(--raya)}
	.saber code{font-family:"DM Mono",monospace;font-size:11px;color:var(--tenue);padding-top:3px}
	.saber b{display:block;font-family:"Bricolage Grotesque",Georgia,serif;font-size:1.02rem;
		color:var(--tinta);letter-spacing:-.01em}
	.saber p{margin:5px 0 0;font-size:14.5px}

	/* ── objetivos prescriptos junto a los criterios ── */
	.prescripto{border:1px solid var(--epa);background:var(--epa-w);padding:16px 18px}
	.prescripto h3{font-family:"Bricolage Grotesque",Georgia,serif;font-size:1.08rem;font-weight:600;
		color:var(--tinta);margin:0 0 7px;letter-spacing:-.01em}
	.prescripto .nota{font-size:14.5px;margin:0 0 12px}
	.objs{margin:0 0 12px;padding-left:20px}
	.objs li{margin-bottom:9px;font-size:15px}
	.objs b{display:block;color:var(--tinta);font-weight:600}
	.objs span{font-family:"DM Mono",monospace;font-size:12px;letter-spacing:.03em;color:var(--tenue)}
	.traer{background:none;border:1px solid var(--epa);color:var(--epa);cursor:pointer;
		font-family:"DM Mono",monospace;font-size:11.5px;letter-spacing:.09em;text-transform:uppercase;
		padding:6px 13px}
	.traer:hover{background:var(--epa);color:var(--hoja)}
	.prescripto details{margin-top:11px}
	.prescripto summary{cursor:pointer;font-family:"DM Mono",monospace;font-size:12px;
		letter-spacing:.06em;color:var(--tenue)}
	.prescripto summary:hover{color:var(--tinta)}
	.prescripto details p,.prescripto details li{font-size:14.5px}

	/* ── unidades ── */
	.unidades{margin-top:24px}
	.tituloU{display:flex;align-items:baseline;gap:14px;margin-bottom:12px}
	.agregar{background:none;border:1px solid var(--violeta);color:var(--violeta);cursor:pointer;
		font-family:"DM Mono",monospace;font-size:12.5px;letter-spacing:.09em;text-transform:uppercase;
		padding:5px 12px;margin-left:auto}
	.agregar:hover{background:var(--violeta);color:var(--hoja)}

	.unidad{background:var(--hoja);border:1px solid var(--raya);margin-bottom:10px;
		box-shadow:var(--sombra)}
	.unidad header{display:grid;grid-template-columns:auto 1fr auto auto;gap:14px;
		align-items:start;padding:14px 16px}
	.orden{font-family:"DM Mono",monospace;font-size:13.5px;color:var(--pale);
		border:1px solid var(--raya2);width:24px;height:24px;display:grid;place-items:center}
	.cabeza h3{font-family:"Bricolage Grotesque",Georgia,serif;font-weight:600;font-size:1.08rem;
		color:var(--tinta);margin:0;letter-spacing:-.01em}
	.cabeza p{margin:4px 0 0;font-size:15px;color:var(--texto)}
	.tags{display:flex;gap:5px;flex-wrap:wrap;margin-top:7px;align-items:center}
	.tags code{font-family:"DM Mono",monospace;font-size:11.5px;padding:2px 6px}
	.tags code.m{background:var(--mat-w);color:var(--mat)}
	.tags code.i{background:var(--inf-w);color:var(--inf)}
	.tags code.e{background:var(--epa-w);color:var(--epa)}
	.esepa{font-family:"DM Mono",monospace;font-size:11px;letter-spacing:.09em;text-transform:uppercase;
		color:var(--epa);border:1px solid var(--epa);padding:2px 6px;text-decoration:none}
	.esepa.link:hover{background:var(--epa-w)}
	.clases{font-size:14px;color:var(--tenue);white-space:nowrap;font-family:"DM Mono",monospace}
	.clases b{font-family:"Bricolage Grotesque",Georgia,serif;font-size:1.3rem;color:var(--tinta);
		display:block;text-align:right;letter-spacing:-.02em}
	.mandos{display:flex;gap:5px;align-items:flex-start}
	.mandos form{display:flex;gap:2px}
	.mandos button{background:none;border:1px solid var(--raya2);color:var(--tenue);cursor:pointer;
		font-family:"DM Mono",monospace;font-size:12.5px;padding:4px 8px}
	.mandos button:hover:not(:disabled){color:var(--tinta);border-color:var(--tinta)}
	.mandos button:disabled{opacity:.3;cursor:default}
	.extra{padding:0 16px 14px 54px;font-size:14.5px;color:var(--texto)}
	.extra p{margin:0 0 4px}
	.extra b{color:var(--tinta);font-weight:600}
	.vacio{font-family:"DM Mono",monospace;font-size:13.5px;color:var(--tenue);
		border:1px dashed var(--raya2);padding:20px;text-align:center}

	/* ── formularios ── */
	.editor,.marco2{background:var(--papel);border-top:1px solid var(--raya);padding:16px 18px;
		display:flex;flex-direction:column;gap:11px}
	.marco2{margin-top:24px;background:var(--hoja);border:1px solid var(--raya);
		box-shadow:var(--sombra);padding:18px 20px 20px}
	.dos{display:grid;grid-template-columns:1fr 130px;gap:11px}
	.editor .dos:has(select){grid-template-columns:1fr 1fr}
	@media(max-width:620px){.dos{grid-template-columns:1fr}}
	label{display:flex;flex-direction:column;gap:5px;font-family:"DM Mono",monospace;
		font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--tenue)}
	input,textarea,select{font-family:Manrope,sans-serif;font-size:15px;color:var(--tinta);
		background:var(--hoja);border:1px solid var(--raya2);padding:8px 10px;text-transform:none;
		letter-spacing:normal;width:100%}
	textarea{resize:vertical;line-height:1.5}
	input:focus,textarea:focus,select:focus{outline:2px solid var(--violeta);outline-offset:-1px}
	fieldset{border:1px solid var(--raya2);padding:11px 13px;display:grid;
		grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:4px 14px}
	legend{font-family:"DM Mono",monospace;font-size:11.5px;letter-spacing:.11em;
		text-transform:uppercase;color:var(--tenue);padding:0 5px}
	.tick{flex-direction:row;align-items:baseline;gap:7px;font-family:Manrope,sans-serif;
		font-size:14.5px;text-transform:none;letter-spacing:normal;color:var(--texto);cursor:pointer}
	.tick input{width:auto}
	.tick code{font-family:"DM Mono",monospace;font-size:11.5px;color:var(--tenue)}
	.fila{display:flex;gap:10px;align-items:center}
	.guardar{background:var(--violeta);border:1px solid var(--violeta);color:var(--hoja);cursor:pointer;
		font-family:"DM Mono",monospace;font-size:12.5px;letter-spacing:.09em;text-transform:uppercase;
		padding:8px 16px;align-self:flex-start}
	.guardar:hover{opacity:.88}
	.borrar{background:none;border:1px solid var(--raya2);color:var(--tenue);cursor:pointer;
		font-family:"DM Mono",monospace;font-size:12.5px;letter-spacing:.09em;text-transform:uppercase;
		padding:8px 14px;margin-left:auto}
	.borrar:hover{border-color:var(--inf);color:var(--inf)}
</style>
