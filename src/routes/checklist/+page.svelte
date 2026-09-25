<script lang="ts">
	import { enhance } from '$app/forms';
	import { CHECKLIST } from '$lib/pca';
	let { data } = $props();

	const hechos = $derived(
		CHECKLIST.filter((c) => {
			const a = c.auto ? data.auto[c.auto] : null;
			return a ? a.ok : data.items[c.clave]?.marcado;
		}).length
	);
</script>

<svelte:head><title>Areal · checklist del área</title></svelte:head>

<header>
	<h1>Checklist por área</h1>
	<span class="periodo">{data.periodo}</span>
	<span class="marcador" class:full={hechos === CHECKLIST.length}>
		{hechos} de {CHECKLIST.length}
	</span>
</header>

<main>
	<form class="cabecera" method="POST" action="?/cabecera" use:enhance>
		<input type="hidden" name="id" value={data.checklist.id} />
		<div class="cab-campos">
			<label>Área / Interárea / Equipo
				<input value="Matemática e Informática" readonly />
			</label>
			<label>Fecha
				<input type="date" name="fecha" value={data.checklist.fecha ?? ''} />
			</label>
			<label>Docentes que participan
				<input name="participantes" value={data.checklist.participantes}
					placeholder={data.docentes.join(', ')} />
			</label>
		</div>
		<button class="chico" type="submit">Guardar cabecera</button>
	</form>

	<div class="lista">
		{#each CHECKLIST as c, i}
			{@const item = data.items[c.clave]}
			{@const a = c.auto ? data.auto[c.auto] : null}
			<article class="item" class:resuelto={a ? a.ok : item?.marcado} class:auto={!!a}>
				<div class="izq">
					<span class="n">{i + 1}</span>
					{#if a}
						<span class="sello" class:si={a.ok}>{a.ok ? '✓' : '·'}</span>
					{/if}
				</div>

				<div class="med">
					<p class="rot">{c.rot}</p>
					{#if c.detalle}<p class="detalle">{c.detalle}</p>{/if}

					{#if a}
						<p class="respuesta" class:ok={a.ok}>
							<b>Lo contesta Areal:</b> {a.texto}
						</p>
					{/if}
					{#if c.fueraDeLaApp}
						<p class="afuera">
							Son datos de estudiantes: viven en el Drive de la escuela, no en Areal.
							Acá va el enlace.
						</p>
					{/if}

					<form method="POST" action="?/guardar" use:enhance>
						<input type="hidden" name="id" value={item?.id} />
						{#if c.pide === 'enlace'}
							<input name="enlace" value={item?.enlace ?? ''} placeholder="Pegá el enlace del Drive" />
						{/if}
						<textarea name="comentario" rows="2" placeholder="Comentarios, aclaraciones, dudas"
							>{item?.comentario ?? ''}</textarea>
						<div class="acciones">
							<label class="tick">
								<input type="checkbox" name="marcado" checked={item?.marcado} />
								{a ? 'Confirmado para entregar' : 'Lo tenemos'}
							</label>
							<button class="chico" type="submit">Guardar</button>
						</div>
					</form>
				</div>
			</article>
		{/each}
	</div>

	<p class="pie">
		Cinco de los siete ítems los tiene que contestar el equipo. Dos los contesta Areal con lo
		que ya está cargado: la <a href="/planificaciones/area">planificación de área</a> y el acuerdo de
		reunión. Cuando la PCA esté completa acá adentro, el ítem 2 deja de ser una casilla y pasa
		a ser un hecho verificable.
	</p>
</main>

<style>
	header{display:flex;align-items:center;gap:18px;flex-wrap:wrap;
		padding:20px 30px;border-bottom:1px solid var(--raya2)}
	h1{font-family:"Bricolage Grotesque",Georgia,serif;font-weight:700;font-size:1.5rem;
		color:var(--tinta);margin:0;letter-spacing:-.02em}
	.periodo{font-family:"DM Mono",monospace;font-size:13.5px;letter-spacing:.1em;
		text-transform:uppercase;color:var(--tenue)}
	.marcador{margin-left:auto;font-family:"DM Mono",monospace;font-size:14px;font-weight:500;
		padding:7px 14px;background:var(--franja);color:var(--tenue);border:1px solid var(--raya2)}
	.marcador.full{background:var(--violeta);color:#fff;border-color:var(--violeta)}

	main{max-width:940px;margin:0 auto;padding:28px 30px 80px}

	.cabecera{border:1px solid var(--raya2);background:var(--hoja);padding:18px 20px;margin-bottom:26px}
	.cab-campos{display:grid;grid-template-columns:1.4fr .7fr 1.4fr;gap:14px}
	@media(max-width:800px){.cab-campos{grid-template-columns:1fr}}
	label{display:block;font-family:"DM Mono",monospace;font-size:11.5px;letter-spacing:.12em;
		text-transform:uppercase;color:var(--tenue);margin-bottom:10px}
	input,textarea{width:100%;margin-top:6px;padding:9px 11px;border:1px solid var(--raya2);
		background:var(--papel);color:var(--tinta);font-family:Manrope,sans-serif;font-size:15px;
		text-transform:none;letter-spacing:0;line-height:1.45}
	input[readonly]{color:var(--tenue);background:var(--franja)}
	input:focus,textarea:focus{outline:2px solid var(--violeta);outline-offset:-1px}
	textarea{resize:vertical}

	.lista{display:flex;flex-direction:column;gap:1px;background:var(--raya)}
	.item{background:var(--hoja);display:grid;grid-template-columns:44px 1fr;gap:14px;
		padding:20px 22px;border-left:3px solid transparent}
	.item.resuelto{border-left-color:var(--violeta)}
	.item.auto{background:var(--franja)}
	.izq{display:flex;flex-direction:column;align-items:center;gap:7px}
	.n{font-family:"DM Mono",monospace;font-size:14px;font-weight:500;color:var(--pale)}
	.item.resuelto .n{color:var(--violeta)}
	.sello{font-size:15px;color:var(--pale);line-height:1}
	.sello.si{color:var(--violeta);font-weight:700}

	.rot{font-size:16.5px;line-height:1.4;color:var(--tinta);font-weight:600;margin:0 0 6px}
	.detalle{font-size:14px;color:var(--tenue);line-height:1.45;margin:0 0 10px}
	.respuesta{font-size:15.5px;line-height:1.5;margin:0 0 12px;padding:11px 14px;
		background:var(--papel);border-left:3px solid var(--raya2);color:var(--texto)}
	.respuesta.ok{border-left-color:var(--violeta);background:var(--violeta-w)}
	.respuesta b{color:var(--tinta)}
	.afuera{font-size:14.5px;line-height:1.5;margin:0 0 12px;padding:10px 13px;
		background:var(--epa-w);border-left:3px solid var(--epa);color:var(--texto)}
	.acciones{display:flex;align-items:center;gap:18px;flex-wrap:wrap;margin-top:10px}
	.tick{display:flex;align-items:center;gap:8px;text-transform:none;letter-spacing:0;
		font-family:Manrope,sans-serif;font-size:15.5px;color:var(--texto);margin:0}
	.tick input{width:auto;margin:0}
	.chico{background:var(--violeta);color:#fff;border:none;cursor:pointer;
		font-size:15px;font-weight:600;padding:8px 16px}
	.chico:hover{opacity:.87}
	.pie{font-size:15.5px;line-height:1.6;color:var(--tenue);margin-top:30px;
		padding-top:20px;border-top:1px solid var(--raya)}
	.pie a{color:var(--violeta)}
</style>
