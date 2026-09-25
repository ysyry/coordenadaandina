<script lang="ts">
	import { enhance } from '$app/forms';
	import { beforeNavigate } from '$app/navigation';
	import type { SubmitFunction } from '@sveltejs/kit';
	import Motivacion from '$lib/formularios/Motivacion.svelte';
	import Texto from '$lib/formularios/Texto.svelte';
	import { campo, campoOtro, vaEnTabla, OTRA, SEP } from '$lib/formularios/encuesta';

	let { data, form } = $props();

	type P = (typeof data.preguntas)[number];
	const cerrada = $derived(data.encuesta.estado === 'cerrada');
	const guardado = $derived(data.guardado as Record<string, string>);

	/** Lo que se está escribiendo y todavía no llegó a la base. */
	let vivo = $state<Record<string, string>>({});
	const v = (k: string) => (k in vivo ? vivo[k] : (guardado[k] ?? ''));
	const elegidos = (k: string) => v(k).split(SEP).filter(Boolean);
	const tiene = (k: string, o: string) => elegidos(k).includes(o);

	/* ---- Bloques: cada sección, más las preguntas sueltas si las hay ---- */
	const bloques = $derived.by(() => {
		const conSeccion = data.secciones.map((s) => ({ ...s, preguntas: data.preguntas.filter((p) => p.seccionId === s.id) }));
		const sueltas = data.preguntas.filter((p) => !p.seccionId || !data.secciones.some((s) => s.id === p.seccionId));
		return [...(sueltas.length ? [{ id: 'sueltas', titulo: 'Preguntas', apunta: '', saber: '', preguntas: sueltas }] : []), ...conSeccion]
			.filter((b) => b.preguntas.length);
	});

	/** Dentro de un bloque, las preguntas que se repiten y caben en una celda van juntas en una tabla. */
	type Tramo = { tabla: true; por: string; preguntas: P[] } | { tabla: false; pregunta: P };
	const tramos = (ps: P[]): Tramo[] => {
		const out: Tramo[] = [];
		for (const p of ps) {
			if (!p.entidades.length && p.por !== 'nada') continue;
			const ult = out.at(-1);
			if (vaEnTabla(p) && ult?.tabla && ult.por === p.por && ult.preguntas[0].alcance === p.alcance) ult.preguntas.push(p);
			else if (vaEnTabla(p)) out.push({ tabla: true, por: p.por, preguntas: [p] });
			else out.push({ tabla: false, pregunta: p });
		}
		return out;
	};
	const porGrupo = (ents: P['entidades']) => {
		const g = new Map<string, P['entidades']>();
		for (const e of ents) g.set(e.grupo ?? '', [...(g.get(e.grupo ?? '') ?? []), e]);
		return [...g];
	};
	const sinDictados = $derived(!data.misDictados.length && data.preguntas.some((p) => p.por !== 'nada' && p.alcance === 'mios'));
	const omitidas = (ps: P[]) => ps.filter((p) => p.por !== 'nada' && !p.entidades.length).length;

	/* ---- Guardado ---- */
	const camposDe = (b: { preguntas: P[] }) => b.preguntas.flatMap((p) => p.campos);
	const sucio = (b: { preguntas: P[] }) =>
		camposDe(b).some((k) => (vivo[k] ?? guardado[k] ?? '').trim() !== (guardado[k] ?? '').trim());
	const algoSucio = $derived(bloques.some(sucio));

	let formas = $state<Record<string, HTMLFormElement>>({});
	const relojes: Record<string, ReturnType<typeof setTimeout>> = {};
	function leer(b: { id: string; preguntas: P[] }, f: HTMLFormElement) {
		const fd = new FormData(f);
		const o = { ...vivo };
		for (const c of camposDe(b)) o[c] = fd.getAll(c).map(String).filter((x) => x.trim() !== '').join(SEP);
		vivo = o;
		clearTimeout(relojes[b.id]);
		relojes[b.id] = setTimeout(() => sucio(b) && f.requestSubmit(), 2000);
	}
	let guardando = $state<string | null>(null);
	const alEnviar = (id: string): SubmitFunction => () => {
		clearTimeout(relojes[id]);
		guardando = id;
		return async ({ update }) => {
			await update({ reset: false });
			guardando = null;
		};
	};
	$effect(() => {
		if (!algoSucio) return;
		const avisar = (e: BeforeUnloadEvent) => e.preventDefault();
		window.addEventListener('beforeunload', avisar);
		return () => window.removeEventListener('beforeunload', avisar);
	});
	beforeNavigate(({ cancel, type }) => {
		if (type !== 'leave' && algoSucio && !confirm('Hay respuestas sin guardar. ¿Salir igual?')) cancel();
	});

	let abierto = $state<string | null>(null);
	const toggle = (id: string) => {
		if (abierto) {
			const b = bloques.find((x) => x.id === abierto);
			if (b && sucio(b)) { clearTimeout(relojes[b.id]); formas[b.id]?.requestSubmit(); }
		}
		abierto = abierto === id ? null : id;
	};
	const contestadas = (ps: P[]) =>
		ps.filter((p) => p.campos.some((k) => !k.startsWith('o~') && (guardado[k] ?? '').trim())).length;
	const cuentan = (ps: P[]) => ps.filter((p) => p.por === 'nada' || p.entidades.length).length;
</script>

<svelte:head><title>Areal · {data.encuesta.titulo}</title></svelte:head>

{#snippet control(p: P, k: string, ko: string, enCelda: boolean)}
	{#if p.tipo === 'corta'}
		<input type="text" name={k} value={v(k)} aria-label={p.texto} />
	{:else if p.tipo === 'parrafo'}
		<textarea name={k} rows="3" aria-label={p.texto}>{v(k)}</textarea>
	{:else if p.tipo === 'numero'}
		<input type="number" min="0" name={k} value={v(k)} class="num" aria-label={p.texto} />
	{:else if p.tipo === 'semana'}
		<input type="text" list="semanas" name={k} value={v(k)} class="sem" aria-label={p.texto} />
	{:else if p.tipo === 'si'}
		<input type="checkbox" name={k} value="sí" checked={v(k) === 'sí'} aria-label={p.texto} />
	{:else if p.tipo === 'una' && enCelda}
		<select name={k} aria-label={p.texto}>
			<option value="">—</option>
			{#each p.opcionesLista as o}<option value={o.id} selected={tiene(k, o.id)}>{o.rotulo}</option>{/each}
			{#if p.conOtra}<option value={OTRA} selected={tiene(k, OTRA)}>Otra</option>{/if}
		</select>
	{:else}
		<span class="ops">
			{#each p.opcionesLista as o}
				<label>
					<input type={p.tipo === 'varias' ? 'checkbox' : 'radio'} name={k} value={o.id} checked={tiene(k, o.id)} />
					<span>{o.rotulo}{#if o.detalle}<i> · {o.detalle}</i>{/if}</span>
				</label>
			{/each}
			{#if p.conOtra}
				<label>
					<input type={p.tipo === 'varias' ? 'checkbox' : 'radio'} name={k} value={OTRA} checked={tiene(k, OTRA)} />
					<span>Otra</span>
				</label>
			{/if}
		</span>
	{/if}
	{#if p.conOtra && tiene(k, OTRA)}
		<input class="otro" type="text" name={ko} value={v(ko)} placeholder="¿Cuál?" aria-label="Otra · {p.texto}" />
	{/if}
{/snippet}

<div class="encabezado">
	<div>
		<h1>{data.encuesta.titulo}</h1>
		{#if data.encuesta.estado !== 'abierta'}
			<p class="estado">{data.encuesta.estado === 'cerrada' ? 'Cerrada: se puede leer, pero ya no se contesta.' : 'Borrador: todavía no la ven las demás.'}</p>
		{/if}
		{#if data.puedeEditar}
			<p class="acciones"><a href="/formularios/{data.encuesta.id}/editar">Editar</a> · <a href="/formularios/{data.encuesta.id}/respuestas">Respuestas</a></p>
		{/if}
	</div>
	<div class="avance">
		<span class="c">{data.avance.hechas} de {data.avance.total}</span>
		<span class="barra"><span style="width:{data.avance.total ? Math.round((100 * data.avance.hechas) / data.avance.total) : 0}%"></span></span>
		{#if data.avance.faltan.length}<span class="faltan">Obligatorias sin completar: {data.avance.faltan.join(', ')}</span>{/if}
	</div>
</div>

<main>
	<Motivacion texto={data.encuesta.motivacion} />

	{#if data.misDictados.length}
		<p class="mios">Tus materias: {data.misDictados.join(', ')}</p>
	{:else if sinDictados}
		<p class="aviso">
			Algunas preguntas se responden por cada materia y curso que das. Para verlas, cargá tus materias
			en <a href="/perfil">tu perfil</a>.
		</p>
	{/if}

	{#each bloques as b}
		<section class="nudo" class:abierto={abierto === b.id}>
			<button type="button" class="cab" onclick={() => toggle(b.id)} aria-expanded={abierto === b.id}>
				<span class="cuenta">{#if sucio(b)}<i>sin guardar · </i>{/if}{contestadas(b.preguntas)}/{cuentan(b.preguntas)}</span>
				<span class="tit">{b.titulo}</span>
				{#if b.apunta}<span class="apunta">{b.apunta}</span>{/if}
			</button>

			<form
				method="POST" action="?/guardar" class="cuerpo"
				hidden={abierto !== b.id}
				bind:this={formas[b.id]}
				use:enhance={alEnviar(b.id)}
				oninput={(e) => leer(b, e.currentTarget)}
			>
				<input type="hidden" name="bloque" value={b.id} />
				<input type="hidden" name="_campos" value={camposDe(b).join(',')} />
				{#if b.saber}<p class="saber"><Texto texto={b.saber} /></p>{/if}

				<fieldset disabled={cerrada}>
					{#each tramos(b.preguntas) as t}
						{#if t.tabla}
							<div class="tabla">
								<table>
									<thead>
										<tr>
											<th scope="col"></th>
											{#each t.preguntas as p}<th scope="col">{p.n}. {p.texto}{#if p.obligatoria} *{/if}</th>{/each}
										</tr>
									</thead>
									<tbody>
										{#each porGrupo(t.preguntas[0].entidades) as [grupo, ents]}
											{#if grupo}
												<tr class="grupo"><th colspan={t.preguntas.length + 1}>
													{grupo}
													{#if ents[0]?.fuente}<a class="fuente" href={ents[0].fuente} target="_blank" rel="noopener noreferrer">Mapa de área</a>{/if}
												</th></tr>
											{/if}
											{#each ents as e}
												<tr>
													<th scope="row">
														<span class="ent">{e.rotulo}</span>
														{#if e.contenidos}<details class="cont"><summary>Contenidos</summary><p>{e.contenidos}</p></details>{/if}
														{#if e.detalle}<span class="det">{e.detalle}</span>{/if}
													</th>
													{#each t.preguntas as p}
														<td class:chk={p.tipo === 'si'}>{@render control(p, campo(p.id, e.tipo, e.id), campoOtro(p.id, e.tipo, e.id), true)}</td>
													{/each}
												</tr>
											{/each}
										{/each}
									</tbody>
								</table>
							</div>
							{#each t.preguntas.filter((p) => p.ayuda) as p}<p class="ayuda">{p.n}. <Texto texto={p.ayuda} /></p>{/each}
						{:else}
							{@const p = t.pregunta}
							<div class="preg" class:subj={p.clase === 'subjetivo'}>
								<span class="q"><b>{p.n}.</b> {p.texto}{#if p.obligatoria}<i> · obligatoria</i>{/if}</span>
								{#if p.ayuda}<span class="ayuda"><Texto texto={p.ayuda} /></span>{/if}
								{#if p.pegado.length}
									<ol class="pegado">{#each p.pegado as c}<li><b>{c.rotulo}.</b> {c.detalle ?? ''}</li>{/each}</ol>
								{/if}
								{#if p.por === 'nada'}
									{@render control(p, campo(p.id), campoOtro(p.id), false)}
								{:else}
									{#each p.entidades as e}
										<div class="rep">
											<span class="ent">{e.rotulo}</span>
											{@render control(p, campo(p.id, e.tipo, e.id), campoOtro(p.id, e.tipo, e.id), false)}
										</div>
									{/each}
								{/if}
							</div>
						{/if}
					{/each}
					{#if omitidas(b.preguntas)}
						<p class="ayuda">{omitidas(b.preguntas)} pregunta(s) de este bloque aparecen cuando tengas materias cargadas en tu perfil.</p>
					{/if}
				</fieldset>

				{#if !cerrada}
					<div class="pie">
						<button type="submit" disabled={guardando === b.id}>Guardar</button>
						{#if guardando === b.id}<span class="ok">Guardando…</span>
						{:else if sucio(b)}<span class="sin">Sin guardar</span>
						{:else if form?.guardado === b.id}<span class="ok">Guardado</span>{/if}
					</div>
				{/if}
			</form>
		</section>
	{/each}

	<datalist id="semanas">
		<option value="ya lo di"></option>
		<option value="no lo doy"></option>
	</datalist>

	<p class="cierre">Las respuestas se guardan solas mientras escribís. Podés cerrar y seguir en otro momento.</p>
</main>

<style>
	.encabezado{display:flex;gap:24px;align-items:flex-end;flex-wrap:wrap;padding:26px 30px 20px;border-bottom:1px solid var(--raya2)}
	h1{font-family:"Bricolage Grotesque",Georgia,serif;font-weight:700;font-size:1.5rem;color:var(--tinta);margin:0;letter-spacing:-.02em}
	.estado{font-size:14.5px;color:var(--epa);margin:6px 0 0}
	.acciones{font-size:14px;margin:6px 0 0;color:var(--tenue)}
	.acciones a{color:var(--violeta)}
	.avance{margin-left:auto;display:flex;flex-direction:column;gap:5px;min-width:160px}
	.avance .c{font-family:"DM Mono",monospace;font-size:13px;color:var(--violeta)}
	.faltan{font-size:12.5px;color:var(--inf)}
	.barra{background:var(--franja);height:6px;display:block}
	.barra span{display:block;height:100%;background:var(--violeta)}

	main{max-width:960px;margin:0 auto;padding:22px 30px 80px}
	.mios{font-size:14px;color:var(--tenue);margin:0 0 18px}
	.aviso{font-size:14.5px;color:var(--epa);margin:0 0 18px}
	.aviso a{color:var(--violeta)}

	.nudo{border:1px solid var(--raya2);background:var(--hoja);margin-bottom:10px}
	.nudo.abierto{box-shadow:var(--sombra)}
	.cab{width:100%;display:block;text-align:left;background:none;border:none;cursor:pointer;padding:14px 18px;font:inherit}
	.cab .tit{font-family:"Bricolage Grotesque",Georgia,serif;font-weight:600;font-size:1.05rem;color:var(--tinta);display:block}
	.cab .apunta{font-size:13px;color:var(--violeta);font-weight:600}
	.cab .cuenta{float:right;font-family:"DM Mono",monospace;font-size:13px;color:var(--tenue)}
	.cab .cuenta i{font-style:normal;color:var(--epa)}
	.cuerpo{padding:0 18px 20px;display:flex;flex-direction:column;gap:14px}
	.cuerpo[hidden]{display:none}
	fieldset{border:none;margin:0;padding:0;min-width:0;display:flex;flex-direction:column;gap:14px}
	.saber{font-size:14.5px;color:var(--tenue);border-left:3px solid var(--raya2);padding-left:12px;margin:0}

	.tabla{overflow-x:auto;border:1px solid var(--raya)}
	table{border-collapse:collapse;width:100%;font-size:13.5px}
	th,td{padding:7px 9px;border-bottom:1px solid var(--raya);text-align:left;vertical-align:top}
	thead th{font-size:12px;font-weight:600;color:var(--tenue);background:var(--franja);min-width:120px}
	thead th:first-child{min-width:240px}
	/* El tema queda a la vista aunque la tabla se desplace. */
	thead th:first-child,tbody th{position:sticky;left:0;z-index:1}
	tbody th{font-weight:400;color:var(--texto);min-width:240px;max-width:320px;background:var(--hoja);box-shadow:1px 0 0 var(--raya)}
	tr.grupo th{font-family:"Bricolage Grotesque",Georgia,serif;font-weight:700;color:var(--tinta);background:var(--papel)}
	td{color:var(--texto)}
	td.chk{text-align:center}
	.ent{display:block}
	.det{display:block;font-size:12px;color:var(--pale)}
	.fuente{font-family:inherit;font-weight:400;font-size:12.5px;color:var(--violeta);margin-left:10px}
	.cont{font-size:12.5px;color:var(--tenue);margin:2px 0}
	.cont summary{cursor:pointer;color:var(--violeta)}
	.cont p{margin:4px 0 0;line-height:1.45}
	td select{font:inherit;font-size:13px;padding:4px 6px;background:var(--papel);color:var(--texto);border:1px solid var(--raya2);max-width:170px}

	.preg{display:flex;flex-direction:column;gap:6px;padding:12px 0;border-top:1px solid var(--raya)}
	.preg.subj{border-left:3px solid var(--epa);padding-left:12px}
	.q{font-size:15.5px;color:var(--tinta)}
	.q i{font-style:normal;font-size:12.5px;color:var(--inf)}
	.ayuda{font-size:13.5px;color:var(--tenue);margin:0}
	.pegado{margin:2px 0;padding-left:22px;font-size:14px;color:var(--texto);display:flex;flex-direction:column;gap:4px}
	.rep{display:flex;flex-direction:column;gap:4px;margin-top:4px}
	.rep .ent{font-size:13.5px;font-weight:600;color:var(--tenue)}
	input[type=text],input[type=number],textarea{font:inherit;font-size:15px;padding:9px 11px;background:var(--papel);color:var(--texto);border:1px solid var(--raya2);width:100%}
	td input[type=text],td input[type=number]{font-size:13.5px;padding:5px 8px}
	input.num{max-width:120px}
	input.sem{max-width:160px}
	input.otro{font-size:13.5px;padding:5px 8px;margin-top:4px}
	textarea{resize:vertical}
	.ops{display:flex;flex-direction:column;gap:5px;font-size:14.5px}
	.ops label{display:flex;gap:8px;align-items:flex-start;cursor:pointer}
	.ops i{font-style:normal;color:var(--pale);font-size:13px}
	.pie{display:flex;gap:12px;align-items:center;padding-top:6px}
	.pie button{background:var(--violeta);color:#fff;border:none;cursor:pointer;font-size:15px;font-weight:600;padding:10px 20px}
	.pie button:disabled{opacity:.6;cursor:default}
	.ok{font-size:13.5px;color:var(--mat)}
	.sin{font-size:13.5px;color:var(--epa)}
	.cierre{font-size:13.5px;color:var(--pale);margin:24px 0 0}
	@media (max-width:620px){.encabezado{padding:20px 16px}main{padding:18px 16px 60px}.avance{margin-left:0}}
</style>
