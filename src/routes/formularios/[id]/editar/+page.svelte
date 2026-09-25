<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { TIPOS, POR, ALCANCE, ESTADOS, conOpciones, rotuloOpcionesDe, rotuloConcepto } from '$lib/formularios/encuesta';

	let { data, form } = $props();
	type P = (typeof data.preguntas)[number];

	let editando = $state<string | null>(null);
	let nuevaEn = $state<string | null>(null);

	/** Lo que se está eligiendo en el formulario abierto, para mostrar u ocultar campos. */
	let tipoVivo = $state('parrafo');
	let opcionesDeVivo = $state('manual');
	let porVivo = $state('nada');
	const abrir = (p: P | null, seccionId?: string) => {
		editando = p?.id ?? null;
		nuevaEn = p ? null : (seccionId ?? '');
		tipoVivo = p?.tipo ?? 'parrafo';
		opcionesDeVivo = p?.opcionesDe ?? 'manual';
		porVivo = p?.por ?? 'nada';
	};
	const cerrar: SubmitFunction = () => async ({ update, result }) => {
		await update({ reset: false });
		if (result.type === 'success') { editando = null; nuevaEn = null; }
	};

	const fuentes = $derived(['manual', 'usuaria', 'puesto', 'nudo', ...data.conceptos.map((c) => `concepto:${c}`)]);
	const deSeccion = (id: string | null) => data.preguntas.filter((p) => p.seccionId === id);
	const sueltas = $derived(data.preguntas.filter((p) => !p.seccionId || !data.secciones.some((s) => s.id === p.seccionId)));
	const numero = (p: P) => data.preguntas.indexOf(p) + 1;
	const rotulo = <T extends readonly { id: string; rotulo: string }[]>(l: T, id: string) => l.find((x) => x.id === id)?.rotulo ?? id;
</script>

<svelte:head><title>Areal · editar {data.encuesta.titulo}</title></svelte:head>

{#snippet editor(p: P | null, seccionId: string | null)}
	<form method="POST" action="?/pregunta" class="editor" use:enhance={cerrar}>
		<input type="hidden" name="id" value={p?.id ?? ''} />
		<label class="ancho"><span>Pregunta</span><input type="text" name="texto" value={p?.texto ?? ''} required /></label>
		<label class="ancho"><span>Aclaración (opcional)</span><input type="text" name="ayuda" value={p?.ayuda ?? ''} /></label>
		<label><span>Tipo de respuesta</span>
			<select name="tipo" bind:value={tipoVivo}>{#each TIPOS as t}<option value={t.id}>{t.rotulo}</option>{/each}</select>
		</label>
		<label><span>Se contesta</span>
			<select name="por" bind:value={porVivo}>{#each POR as t}<option value={t.id}>{t.rotulo}</option>{/each}</select>
		</label>
		{#if porVivo !== 'nada'}
			<label><span>De cuáles</span>
				<select name="alcance">{#each ALCANCE as t}<option value={t.id} selected={(p?.alcance ?? 'mios') === t.id}>{t.rotulo}</option>{/each}</select>
			</label>
		{/if}
		{#if conOpciones(tipoVivo)}
			<label><span>Opciones</span>
				<select name="opcionesDe" bind:value={opcionesDeVivo}>{#each fuentes as f}<option value={f}>{rotuloOpcionesDe(f)}</option>{/each}</select>
			</label>
			{#if opcionesDeVivo === 'manual'}
				<label class="ancho"><span>Una opción por renglón</span><textarea name="opciones" rows="4">{p?.opciones ?? ''}</textarea></label>
			{/if}
			<label class="casilla"><input type="checkbox" name="conOtra" value="sí" checked={p?.conOtra ?? false} /> Agregar «Otra» con espacio para escribir</label>
		{/if}
		<label><span>Mostrar arriba de la pregunta</span>
			<select name="muestra">
				<option value="">Nada</option>
				{#each data.conceptos as c}<option value="concepto:{c}" selected={p?.muestra === `concepto:${c}`}>{rotuloConcepto(c)}</option>{/each}
			</select>
		</label>
		<label><span>Sección</span>
			<select name="seccionId">
				<option value="">Sin sección</option>
				{#each data.secciones as s}<option value={s.id} selected={(p?.seccionId ?? seccionId) === s.id}>{s.titulo}</option>{/each}
			</select>
		</label>
		<label><span>Clase</span>
			<select name="clase">
				<option value="">—</option>
				<option value="objetivo" selected={p?.clase === 'objetivo'}>Dato</option>
				<option value="subjetivo" selected={p?.clase === 'subjetivo'}>Opinión</option>
			</select>
		</label>
		<label class="casilla"><input type="checkbox" name="obligatoria" value="sí" checked={p?.obligatoria ?? false} /> Obligatoria</label>
		<div class="pie ancho">
			<button type="submit">{p ? 'Guardar' : 'Agregar'}</button>
			<button type="button" class="sec" onclick={() => { editando = null; nuevaEn = null; }}>Cancelar</button>
			{#if p?.respuestas}<span class="nota">Ya tiene {p.respuestas} respuesta(s): si cambiás el tipo o las opciones, revisalas.</span>{/if}
		</div>
	</form>
{/snippet}

{#snippet lista(ps: P[], seccionId: string | null)}
	{#each ps as p}
		<div class="preg">
			{#if editando === p.id}
				{@render editor(p, seccionId)}
			{:else}
				<div class="linea">
					<span class="n">{numero(p)}</span>
					<div class="cuerpo">
						<span class="q">{p.texto}{#if p.obligatoria}<i> · obligatoria</i>{/if}</span>
						<span class="meta">
							{rotulo(TIPOS, p.tipo)}
							{#if p.por !== 'nada'} · {rotulo(POR, p.por).toLowerCase()} ({rotulo(ALCANCE, p.alcance).toLowerCase()}){/if}
							{#if conOpciones(p.tipo)} · opciones: {rotuloOpcionesDe(p.opcionesDe).toLowerCase()}{/if}
							{#if p.respuestas} · {p.respuestas} respuesta(s){/if}
						</span>
					</div>
					<div class="acc">
						<form method="POST" action="?/mover" use:enhance><input type="hidden" name="id" value={p.id} /><input type="hidden" name="dir" value="arriba" /><button title="Subir" aria-label="Subir">↑</button></form>
						<form method="POST" action="?/mover" use:enhance><input type="hidden" name="id" value={p.id} /><input type="hidden" name="dir" value="abajo" /><button title="Bajar" aria-label="Bajar">↓</button></form>
						<button type="button" onclick={() => abrir(p)}>Editar</button>
						<form method="POST" action="?/borrarPregunta" use:enhance={({ cancel }) => { if (!confirm(p.respuestas ? `Esta pregunta tiene ${p.respuestas} respuesta(s). ¿Borrarla igual?` : '¿Borrar la pregunta?')) cancel(); }}>
							<input type="hidden" name="id" value={p.id} /><button class="peligro">Borrar</button>
						</form>
					</div>
				</div>
			{/if}
		</div>
	{/each}
	{#if nuevaEn === (seccionId ?? '')}
		<div class="preg nueva">{@render editor(null, seccionId)}</div>
	{:else}
		<button type="button" class="agregar" onclick={() => abrir(null, seccionId ?? '')}>+ Agregar pregunta</button>
	{/if}
{/snippet}

<div class="encabezado">
	<div>
		<p class="volver"><a href="/formularios">Formularios</a> · <a href="/formularios/{data.encuesta.id}">Ver como la contestan</a> · <a href="/formularios/{data.encuesta.id}/respuestas">Respuestas</a></p>
		<h1>{data.encuesta.titulo}</h1>
	</div>
</div>

<main>
	<form method="POST" action="?/datos" class="datos" use:enhance={() => async ({ update }) => update({ reset: false })}>
		<label class="ancho"><span>Nombre</span><input type="text" name="titulo" value={data.encuesta.titulo} required /></label>
		<label class="ancho"><span>Motivación</span>
			<textarea name="motivacion" rows="3" placeholder="Para qué es esta encuesta. Es lo primero que se lee. Links: [texto](https://…)">{data.encuesta.motivacion}</textarea>
		</label>
		<label><span>Estado</span>
			<select name="estado">
				{#each Object.entries(ESTADOS) as [id, rot]}<option value={id} selected={data.encuesta.estado === id}>{rot}</option>{/each}
			</select>
		</label>
		<div class="pie">
			<button type="submit">Guardar</button>
			{#if form?.hecho === 'datos'}<span class="ok">Guardado</span>{/if}
			{#if form?.error}<span class="error">{form.error}</span>{/if}
		</div>
	</form>

	{#if sueltas.length}
		<section class="seccion">
			<h2>Sin sección</h2>
			{@render lista(sueltas, null)}
		</section>
	{/if}

	{#each data.secciones as s}
		<section class="seccion">
			<form method="POST" action="?/seccion" class="sec-datos" use:enhance={() => async ({ update }) => update({ reset: false })}>
				<input type="hidden" name="id" value={s.id} />
				<input class="tit" type="text" name="titulo" value={s.titulo} aria-label="Título de la sección" />
				<input type="text" name="apunta" value={s.apunta} placeholder="A qué apunta (por ejemplo: PCA 7 · Coordinación de área)" aria-label="A qué apunta" />
				<input type="text" name="saber" value={s.saber} placeholder="Una línea de introducción. Links: [texto](https://…)" aria-label="Introducción" />
				<div class="pie">
					<button type="submit" class="sec">Guardar sección</button>
				</div>
			</form>
			<form method="POST" action="?/borrarSeccion" class="borrar-sec" use:enhance={({ cancel }) => { if (!confirm('Se borra la sección; sus preguntas quedan sin sección.')) cancel(); }}>
				<input type="hidden" name="id" value={s.id} /><button class="peligro">Borrar sección</button>
			</form>
			{@render lista(deSeccion(s.id), s.id)}
		</section>
	{/each}

	<form method="POST" action="?/seccion" use:enhance>
		<input type="hidden" name="titulo" value="Nueva sección" />
		<button class="agregar">+ Agregar sección</button>
	</form>

	{#if !data.secciones.length && !sueltas.length}
		<section class="seccion">{@render lista([], null)}</section>
	{/if}

	<form method="POST" action="?/borrar" class="borrar" use:enhance={({ cancel }) => { if (!confirm('Se borra la encuesta con todas sus respuestas. ¿Seguir?')) cancel(); }}>
		<button class="peligro">Borrar la encuesta</button>
	</form>
</main>

<style>
	.encabezado{padding:22px 30px 18px;border-bottom:1px solid var(--raya2)}
	.volver{font-size:13.5px;color:var(--tenue);margin:0 0 6px}
	.volver a{color:var(--violeta)}
	h1{font-family:"Bricolage Grotesque",Georgia,serif;font-weight:700;font-size:1.5rem;color:var(--tinta);margin:0}
	main{max-width:920px;margin:0 auto;padding:22px 30px 80px;display:flex;flex-direction:column;gap:16px}
	h2{font-family:"Bricolage Grotesque",Georgia,serif;font-size:1.1rem;color:var(--tinta);margin:0 0 8px}
	label{display:flex;flex-direction:column;gap:4px;font-size:13px;color:var(--tenue)}
	label.casilla{flex-direction:row;align-items:center;gap:8px;font-size:14px;color:var(--texto)}
	input[type=text],textarea,select{font:inherit;font-size:14.5px;padding:8px 10px;background:var(--papel);color:var(--texto);border:1px solid var(--raya2);width:100%}
	textarea{resize:vertical}
	.datos,.editor{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px;align-items:end}
	.datos{border:1px solid var(--raya2);background:var(--hoja);padding:18px}
	.ancho{grid-column:1/-1}
	.pie{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
	button{font:inherit;font-size:14px;cursor:pointer;border:1px solid var(--raya2);background:var(--papel);color:var(--texto);padding:6px 12px}
	.pie button[type=submit]:not(.sec){background:var(--violeta);color:#fff;border-color:var(--violeta);font-weight:600;padding:8px 18px}
	.peligro{color:var(--inf);border-color:transparent;background:none}
	.ok{font-size:13.5px;color:var(--mat)}
	.error,.nota{font-size:13px;color:var(--inf)}
	.seccion{border:1px solid var(--raya2);background:var(--hoja);padding:16px 18px;display:flex;flex-direction:column;gap:6px;position:relative}
	.sec-datos{display:flex;flex-direction:column;gap:6px;margin-bottom:6px}
	.sec-datos .tit{font-family:"Bricolage Grotesque",Georgia,serif;font-weight:600;font-size:1.05rem;color:var(--tinta)}
	.borrar-sec{position:absolute;top:10px;right:10px}
	.preg{border-top:1px solid var(--raya);padding:10px 0}
	.preg.nueva{border-top:2px solid var(--violeta)}
	.linea{display:flex;gap:12px;align-items:flex-start}
	.linea .n{font-family:"DM Mono",monospace;font-size:13px;color:var(--pale);min-width:22px;padding-top:2px}
	.linea .cuerpo{flex:1;display:flex;flex-direction:column;gap:2px}
	.q{font-size:15px;color:var(--tinta)}
	.q i{font-style:normal;font-size:12.5px;color:var(--inf)}
	.meta{font-size:12.5px;color:var(--pale)}
	.acc{display:flex;gap:4px;align-items:center}
	.acc form{display:contents}
	.acc button{padding:3px 8px;font-size:13px}
	.agregar{align-self:flex-start;border:1px dashed var(--raya2);background:none;color:var(--violeta);margin-top:6px}
	.borrar{margin-top:20px}
	@media (max-width:620px){.encabezado,main{padding-left:16px;padding-right:16px}.linea{flex-wrap:wrap}.acc{width:100%;justify-content:flex-end}}
</style>
