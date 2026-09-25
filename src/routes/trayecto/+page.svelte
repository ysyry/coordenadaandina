<script lang="ts">
	let { data } = $props();
	const ESPACIOS = [
		{ id: 'MAT', rot: 'Matemática' },
		{ id: 'INF', rot: 'Informática' },
		{ id: 'EPA-MI', rot: 'EPA' }
	];
	const cuatris = $derived([...new Set(data.filas.map((f) => f.c))]);
	const enlace = (anio: number, espacio: string) => `/trayecto?anio=${anio}&espacio=${espacio}`;
	/** De lo contestado, lo que más dice del estado: la primera respuesta de la unidad. */
	const principal = (u: (typeof data.filas)[number]['unidades'][number]) => u.dado[0];
</script>

<svelte:head><title>Areal · trayecto</title></svelte:head>

<div class="encabezado">
	<div>
		<h1>Trayecto</h1>
		<p class="sub">Lo que el diseño espera, lo que planificamos y lo que se dio, nudo por nudo.</p>
	</div>
</div>

<main>
	<nav class="filtros" aria-label="Año y espacio">
		<span class="grupo">
			{#each [1, 2, 3, 4, 5] as a}
				<a href={enlace(a, data.codigo)} class:on={data.anio === a} aria-current={data.anio === a ? 'page' : undefined}>{a}º</a>
			{/each}
		</span>
		<span class="grupo">
			{#each ESPACIOS as e}
				<a href={enlace(data.anio, e.id)} class:on={data.codigo === e.id} aria-current={data.codigo === e.id ? 'page' : undefined}>{e.rot}</a>
			{/each}
		</span>
	</nav>

	<div class="resumen">
		<div><b>{data.resumen.esperables}</b><span>nudos esperables</span></div>
		<div><b>{data.resumen.planificados}</b><span>planificados</span></div>
		<div><b>{data.resumen.conDato}</b><span>con información de lo dado</span></div>
	</div>
	{#if data.dictados.length}<p class="quien">Se dicta como: {data.dictados.join(', ')}</p>{/if}

	{#if !data.filas.length}
		<p class="vacio">El diseño no tiene nudos de este espacio en {data.anio}º año.</p>
	{/if}

	{#each cuatris as c}
		<section>
			<h2>{c % 2 ? '1er' : '2do'} cuatrimestre</h2>
			<div class="tabla">
				<table>
					<thead><tr><th scope="col">Esperable</th><th scope="col">Planificado</th><th scope="col">Dado</th></tr></thead>
					<tbody>
						{#each data.filas.filter((f) => f.c === c) as f}
							<tr class:vacia={!f.unidades.length}>
								<th scope="row">
									<span class="cod">{f.codigo}</span>
									<span class="tt">{f.titulo ?? f.nudo}</span>
									{#if f.repite}<span class="nota">Repite lo del cuatrimestre anterior</span>{/if}
									<details><summary>Saberes</summary><p>{f.saberes}</p></details>
								</th>
								<td colspan="2" class="par">
									{#each f.unidades as u}
										<div class="fila-u">
											<p class="unidad">{u.titulo}<span>{u.dictado}</span></p>
											<div class="dado">
												{#if principal(u)}
													<span class="estado">{principal(u).valor}</span>
													{#if u.dado.length > 1}
														<details><summary>{u.dado.length - 1} dato(s) más</summary>
															<ul>{#each u.dado.slice(1) as d}<li><b>{d.pregunta}:</b> {d.valor}</li>{/each}</ul>
														</details>
													{/if}
												{:else}
													<span class="sin">Sin datos todavía</span>
												{/if}
												{#if u.clases}<span class="clases">{u.clases} clase(s) registradas</span>{/if}
											</div>
										</div>
									{:else}
										<span class="falta">Sin planificar</span>
									{/each}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>
	{/each}

	{#if data.sueltas.length}
		<section>
			<h2>Planificado sin un nudo de su cuatrimestre</h2>
			<p class="sub2">Unidades que no tienen asignado ningún nudo que el diseño ponga en ese cuatrimestre. Puede ser una ubicación para revisar.</p>
			<ul class="sueltas">
				{#each data.sueltas as u}<li>{u.titulo}<span>{u.dictado} · {u.c % 2 ? '1er' : '2do'} cuatrimestre</span></li>{/each}
			</ul>
		</section>
	{/if}
</main>

<style>
	.encabezado{padding:26px 30px 20px;border-bottom:1px solid var(--raya2)}
	h1{font-family:"Bricolage Grotesque",Georgia,serif;font-weight:700;font-size:1.5rem;color:var(--tinta);margin:0;letter-spacing:-.02em}
	.sub{font-size:15.5px;color:var(--tenue);margin:4px 0 0}
	main{max-width:1080px;margin:0 auto;padding:22px 30px 80px;display:flex;flex-direction:column;gap:18px}
	.filtros{display:flex;gap:18px;flex-wrap:wrap}
	.grupo{display:flex;gap:4px;flex-wrap:wrap}
	.filtros a{border:1px solid var(--raya2);padding:6px 12px;text-decoration:none;color:var(--texto);font-size:14px;background:var(--hoja)}
	.filtros a.on{border-color:var(--violeta);background:var(--violeta-w);color:var(--tinta);font-weight:600}
	.resumen{display:flex;gap:10px;flex-wrap:wrap}
	.resumen div{border:1px solid var(--raya2);background:var(--hoja);padding:10px 16px;display:flex;flex-direction:column;min-width:150px}
	.resumen b{font-family:"Bricolage Grotesque",Georgia,serif;font-size:1.6rem;color:var(--tinta)}
	.resumen span{font-size:13px;color:var(--tenue)}
	.quien{font-size:13.5px;color:var(--pale);margin:-6px 0 0}
	.vacio{color:var(--tenue)}
	h2{font-family:"Bricolage Grotesque",Georgia,serif;font-size:1.1rem;color:var(--tinta);margin:0 0 8px}
	.sub2{font-size:14px;color:var(--tenue);margin:0 0 8px}
	.tabla{overflow-x:auto;border:1px solid var(--raya2);background:var(--hoja)}
	table{border-collapse:collapse;width:100%;min-width:760px;font-size:14px}
	th,td{padding:10px 12px;border-bottom:1px solid var(--raya);text-align:left;vertical-align:top;width:33%}
	thead th{font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:var(--pale);background:var(--franja)}
	tbody th{font-weight:400}
	.cod{font-family:"DM Mono",monospace;font-size:12px;color:var(--violeta);display:block}
	.tt{display:block;color:var(--tinta);font-weight:600}
	.nota{display:block;font-size:12px;color:var(--pale)}
	details{margin-top:4px;font-size:13px;color:var(--tenue)}
	details summary{cursor:pointer;color:var(--violeta)}
	details p{margin:4px 0 0;line-height:1.45}
	details ul{margin:4px 0 0;padding-left:16px}
	.par{width:66%}
	.fila-u{display:grid;grid-template-columns:1fr 1fr;gap:16px;padding:0 0 10px}
	.fila-u + .fila-u{border-top:1px dashed var(--raya);padding-top:10px}
	.unidad{margin:0;color:var(--texto)}
	.unidad span{display:block;font-size:12px;color:var(--pale)}
	.falta{color:var(--inf);font-size:13.5px}
	tr.vacia th .tt{color:var(--tenue)}
	.dado{display:flex;flex-direction:column;gap:2px}
	.estado{color:var(--tinta)}
	.sin{color:var(--pale);font-size:13.5px}
	.clases{font-size:12.5px;color:var(--mat)}
	.sueltas{margin:0;padding-left:18px;display:flex;flex-direction:column;gap:6px;font-size:14px}
	.sueltas span{display:block;font-size:12px;color:var(--pale)}
	@media (max-width:620px){.encabezado,main{padding-left:16px;padding-right:16px}}
</style>
