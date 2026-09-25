<script lang="ts">
	import { ESTADOS } from '$lib/formularios/encuesta';
	let { data, form } = $props();
	let creando = $state(false);
</script>

<svelte:head><title>Areal · formularios</title></svelte:head>

<div class="encabezado">
	<div>
		<h1>Formularios</h1>
		<p class="sub">Las encuestas del área. Cualquiera puede armar una.</p>
	</div>
	<button type="button" class="nueva" onclick={() => (creando = !creando)}>Nueva encuesta</button>
</div>

<main>
	{#if creando || form?.error}
		<form method="POST" action="?/nueva" class="crear">
			<label>
				<span>Nombre de la encuesta</span>
				<input type="text" name="titulo" required />
			</label>
			<button type="submit">Crear y armar</button>
			{#if form?.error}<span class="error">{form.error}</span>{/if}
		</form>
	{/if}

	{#each data.encuestas as e}
		<article class="tarjeta">
			<div class="fila">
				<div>
					<h2>{e.titulo}</h2>
					<p class="meta">
						{#if e.estado !== 'abierta'}<span class="estado">{ESTADOS[e.estado as keyof typeof ESTADOS]}</span> · {/if}
						{e.autora ? `Armada por ${e.autora}` : 'Del área'} · {e.total} preguntas
					</p>
					{#if e.motivacion}<p class="baja">{e.motivacion}</p>{/if}
				</div>
				<div class="botones">
					{#if e.estado !== 'borrador' || e.puedeEditar}
						<a class="abrir" href="/formularios/{e.id}">{e.estado === 'cerrada' ? 'Ver' : e.empezado ? 'Seguir' : 'Contestar'}</a>
					{/if}
					{#if e.puedeEditar}
						<a class="sec" href="/formularios/{e.id}/editar">Editar</a>
						<a class="sec" href="/formularios/{e.id}/respuestas">Respuestas</a>
					{/if}
				</div>
			</div>

			{#if e.estado !== 'borrador'}
				<ul class="gente">
					{#each e.quienes as q}
						<li class:yo={q.soyYo}>
							<span class="n">{q.nombre}{#if q.soyYo} · vos{/if}</span>
							<span class="barra"><span style="width:{e.total ? Math.round((100 * q.hechas) / e.total) : 0}%"></span></span>
							<span class="c">{q.hechas} de {e.total}</span>
						</li>
					{/each}
				</ul>
			{/if}
		</article>
	{:else}
		<p class="vacio">Todavía no hay encuestas.</p>
	{/each}
</main>

<style>
	.encabezado{display:flex;gap:20px;align-items:flex-end;flex-wrap:wrap;padding:26px 30px 20px;border-bottom:1px solid var(--raya2)}
	h1{font-family:"Bricolage Grotesque",Georgia,serif;font-weight:700;font-size:1.5rem;color:var(--tinta);margin:0;letter-spacing:-.02em}
	.sub{font-size:15.5px;color:var(--tenue);margin:4px 0 0}
	.nueva{margin-left:auto;background:var(--violeta);color:#fff;border:none;cursor:pointer;font:inherit;font-weight:600;font-size:15px;padding:10px 20px}
	main{max-width:920px;margin:0 auto;padding:26px 30px 80px;display:flex;flex-direction:column;gap:14px}
	.crear{border:1px solid var(--violeta);background:var(--hoja);padding:16px 18px;display:flex;gap:12px;align-items:flex-end;flex-wrap:wrap}
	.crear label{display:flex;flex-direction:column;gap:4px;flex:1;min-width:240px;font-size:13.5px;color:var(--tenue)}
	.crear input{font:inherit;font-size:15px;padding:9px 11px;background:var(--papel);color:var(--texto);border:1px solid var(--raya2)}
	.crear button{background:var(--violeta);color:#fff;border:none;cursor:pointer;font:inherit;font-weight:600;padding:10px 18px}
	.error{font-size:13.5px;color:var(--inf)}
	.tarjeta{border:1px solid var(--raya2);background:var(--hoja);padding:22px 24px}
	.fila{display:flex;gap:20px;align-items:flex-start;flex-wrap:wrap}
	h2{font-family:"Bricolage Grotesque",Georgia,serif;font-size:1.2rem;color:var(--tinta);margin:0}
	.meta{font-size:13.5px;color:var(--pale);margin:4px 0 0}
	.estado{color:var(--epa);font-weight:600}
	.baja{font-size:15px;color:var(--texto);margin:8px 0 0;max-width:60ch}
	.botones{margin-left:auto;display:flex;flex-direction:column;gap:6px;align-items:stretch}
	.abrir{background:var(--violeta);color:#fff;text-decoration:none;font-weight:600;font-size:15px;padding:10px 20px;text-align:center}
	.sec{border:1px solid var(--raya2);color:var(--texto);text-decoration:none;font-size:14px;padding:6px 14px;text-align:center}
	.gente{list-style:none;margin:20px 0 0;padding:16px 0 0;border-top:1px solid var(--raya);display:flex;flex-direction:column;gap:9px}
	.gente li{display:grid;grid-template-columns:1fr 120px auto;gap:14px;align-items:center;font-size:14.5px;color:var(--tenue)}
	.gente li.yo .n{color:var(--tinta);font-weight:600}
	.barra{background:var(--franja);height:6px;display:block}
	.barra span{display:block;height:100%;background:var(--violeta)}
	.c{font-family:"DM Mono",monospace;font-size:13px}
	.vacio{color:var(--tenue)}
	@media (max-width:620px){.encabezado,main{padding-left:16px;padding-right:16px}.gente li{grid-template-columns:1fr auto}.gente .barra{display:none}.botones{margin-left:0;flex-direction:row}}
</style>
