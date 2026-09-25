<script lang="ts">
	let { data } = $props();
	type P = (typeof data.preguntas)[number];
	type R = (typeof data.respuestas)[number];

	const de = (p: P) => data.respuestas.filter((r) => r.preguntaId === p.id);
	const deSeccion = (id: string | null) => data.preguntas.filter((p) => p.seccionId === id);
	const sueltas = $derived(data.preguntas.filter((p) => !p.seccionId || !data.secciones.some((s) => s.id === p.seccionId)));
	const bloques = $derived([
		...(sueltas.length ? [{ id: null as string | null, titulo: 'Sin sección' }] : []),
		...data.secciones
	]);
	const numero = (p: P) => data.preguntas.indexOf(p) + 1;

	/** Cuántas veces se eligió cada opción, y quiénes. */
	const conteo = (rs: R[]) => {
		const m = new Map<string, string[]>();
		for (const r of rs) {
			for (const e of r.elegidos) m.set(e, [...(m.get(e) ?? []), r.usuaria]);
			if (r.otro) m.set(`Otra: ${r.otro}`, [...(m.get(`Otra: ${r.otro}`) ?? []), r.usuaria]);
		}
		return [...m].sort((a, b) => b[1].length - a[1].length);
	};
	const esEleccion = (p: P) => ['una', 'varias', 'si'].includes(p.tipo);
</script>

<svelte:head><title>Areal · respuestas · {data.encuesta.titulo}</title></svelte:head>

<div class="encabezado">
	<div>
		<p class="volver"><a href="/formularios">Formularios</a> · <a href="/formularios/{data.encuesta.id}/editar">Editar</a></p>
		<h1>Respuestas · {data.encuesta.titulo}</h1>
		<p class="sub">
			{data.personas.length ? `Contestaron ${data.personas.join(', ')}.` : 'Todavía no contestó nadie.'}
		</p>
	</div>
	<a class="csv" href="/formularios/{data.encuesta.id}/respuestas/csv" download>Descargar CSV</a>
</div>

<main>
	{#each bloques as b}
		{@const ps = b.id ? deSeccion(b.id) : sueltas}
		{#if ps.length}
			<section class="seccion">
				<h2>{b.titulo}</h2>
				{#each ps as p}
					{@const rs = de(p)}
					<div class="preg">
						<p class="q"><b>{numero(p)}.</b> {p.texto} <span class="cant">{rs.length ? `${rs.length} respuesta(s)` : 'sin respuestas'}</span></p>
						{#if rs.length && esEleccion(p) && p.por === 'nada'}
							<ul class="conteo">
								{#each conteo(rs) as [opcion, quienes]}
									<li><span class="barra" style="width:{Math.round((100 * quienes.length) / Math.max(data.personas.length, 1))}%"></span>
										<span class="op">{opcion}</span><span class="quienes">{quienes.length} · {quienes.join(', ')}</span></li>
								{/each}
							</ul>
						{:else if rs.length}
							<table>
								<tbody>
									{#each rs as r}
										<tr>
											<th scope="row">{r.usuaria}</th>
											{#if p.por !== 'nada'}<td class="sobre">{r.sobre}{#if r.sobreGrupo}<span>{r.sobreGrupo}</span>{/if}</td>{/if}
											<td class="valor">{r.elegidos.join(' · ')}{#if r.otro}{r.elegidos.length ? ' · ' : ''}Otra: {r.otro}{/if}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						{/if}
					</div>
				{/each}
			</section>
		{/if}
	{/each}
</main>

<style>
	.encabezado{display:flex;gap:20px;align-items:flex-end;flex-wrap:wrap;padding:22px 30px 18px;border-bottom:1px solid var(--raya2)}
	.volver{font-size:13.5px;color:var(--tenue);margin:0 0 6px}
	.volver a{color:var(--violeta)}
	h1{font-family:"Bricolage Grotesque",Georgia,serif;font-weight:700;font-size:1.5rem;color:var(--tinta);margin:0}
	.sub{font-size:14.5px;color:var(--tenue);margin:6px 0 0}
	.csv{margin-left:auto;border:1px solid var(--violeta);color:var(--violeta);text-decoration:none;font-weight:600;font-size:14px;padding:8px 16px}
	main{max-width:960px;margin:0 auto;padding:22px 30px 80px;display:flex;flex-direction:column;gap:14px}
	.seccion{border:1px solid var(--raya2);background:var(--hoja);padding:16px 18px}
	h2{font-family:"Bricolage Grotesque",Georgia,serif;font-size:1.1rem;color:var(--tinta);margin:0 0 6px}
	.preg{border-top:1px solid var(--raya);padding:12px 0}
	.q{font-size:15px;color:var(--tinta);margin:0 0 8px}
	.cant{font-size:12.5px;color:var(--pale);margin-left:6px}
	.conteo{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px}
	.conteo li{position:relative;padding:5px 8px;font-size:14px;display:flex;gap:12px;justify-content:space-between}
	.conteo .barra{position:absolute;inset:0 auto 0 0;background:var(--violeta-w);z-index:0}
	.conteo .op,.conteo .quienes{position:relative}
	.conteo .quienes{color:var(--tenue);font-size:13px;text-align:right}
	table{border-collapse:collapse;width:100%;font-size:14px}
	th,td{padding:6px 8px;border-bottom:1px solid var(--raya);text-align:left;vertical-align:top}
	th{font-weight:600;color:var(--tenue);white-space:nowrap;width:1%}
	.sobre{color:var(--texto);max-width:320px}
	.sobre span{display:block;font-size:12px;color:var(--pale)}
	.valor{color:var(--texto);white-space:pre-line}
	@media (max-width:620px){.encabezado,main{padding-left:16px;padding-right:16px}.csv{margin-left:0}}
</style>
