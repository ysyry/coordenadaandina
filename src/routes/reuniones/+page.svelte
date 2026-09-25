<script lang="ts">
	import { enhance } from '$app/forms';
	import { DIAS } from '$lib/pca';
	let { data } = $props();
	let abrir = $state(false);
	let sumar = $state<string | null>(null);

	const fechaLarga = (f: string) =>
		new Date(f + 'T00:00:00').toLocaleDateString('es-AR',
			{ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
</script>

<svelte:head><title>Areal · reuniones</title></svelte:head>

<div class="encabezado">
	<div>
		<h1>Reuniones y bitácora</h1>
		<p class="sub">Los acuerdos se toman y se pierden. Acá quedan.</p>
	</div>
	<button class="nuevo" type="button" onclick={() => (abrir = !abrir)}>
		{abrir ? 'Cancelar' : '+ Nueva reunión'}
	</button>
</div>

<div class="franja">
	{#if data.reunion.dia}
		<span class="acuerdo-reunion">
			<b>Acuerdo vigente:</b> {DIAS[data.reunion.dia]} de {data.reunion.desde} a
			{data.reunion.hasta}, {data.reunion.frecuencia}
		</span>
	{/if}
	<span class="pend">{data.pendientes} acuerdos pendientes</span>
</div>

<main>
	{#if abrir}
		<form class="alta" method="POST" action="?/nuevaReunion" use:enhance={() => async ({ update }) => {
			abrir = false; await update({ reset: true }); }}>
			<div class="campos">
				<label>Fecha<input type="date" name="fecha" required /></label>
				<label>Título<input name="titulo" required placeholder="Segunda reunión de coordinación" /></label>
			</div>
			<label>Quiénes<input name="participantes" placeholder={data.docentes.join(', ')} /></label>
			<label>De qué se trató<textarea name="caracter" rows="2"></textarea></label>
			<label>Notas<textarea name="notas" rows="5"></textarea></label>
			<button class="chico" type="submit">Guardar</button>
		</form>
	{/if}

	{#each data.reuniones as r}
		<article class="reunion">
			<header>
				<div>
					<p class="fecha">{fechaLarga(r.fecha)}</p>
					<h2>{r.titulo}</h2>
					{#if r.participantes}<p class="quienes">{r.participantes}</p>{/if}
				</div>
				<div class="marcador" class:full={r.hechos === r.total && r.total > 0}>
					<b>{r.hechos}</b><span>de {r.total}</span>
				</div>
			</header>

			{#if r.caracter}<p class="caracter">{r.caracter}</p>{/if}

			{#if r.notas}
				<details class="notas">
					<summary>Notas de la reunión</summary>
					<div class="cuerpo-notas">
						{#each r.notas.split('\n') as linea}
							{#if !linea.trim()}
								<div class="salto"></div>
							{:else if linea === linea.toUpperCase() && linea.length > 3}
								<p class="titulito">{linea}</p>
							{:else}
								<p>{linea}</p>
							{/if}
						{/each}
					</div>
				</details>
			{/if}

			{#each r.bloques as b}
				<section class="bloque">
					<h3>{b.bloque}</h3>
					{#each b.items as a}
						<form class="ac" class:hecho={a.hecho} method="POST" action="?/marcar" use:enhance>
							<input type="hidden" name="id" value={a.id} />
							<label class="tick">
								<input type="checkbox" name="hecho" checked={a.hecho} />
								<span class="t">{a.texto}</span>
							</label>
							{#if a.detalle}<p class="det">{a.detalle}</p>{/if}
							<input class="como" name="como" value={a.comoSeResolvio}
								placeholder={a.hecho ? 'Cómo se resolvió' : 'Notas, o cómo se va a resolver'} />
							<div class="pie-ac">
								{#if a.responsable}<span class="resp">{a.responsable}</span>{/if}
								<button class="mini" type="submit">Guardar</button>
							</div>
						</form>
					{/each}
				</section>
			{/each}

			{#if sumar === r.id}
				<form class="sumar" method="POST" action="?/nuevoAcuerdo" use:enhance={() => async ({ update }) => {
					sumar = null; await update({ reset: true }); }}>
					<input type="hidden" name="reunionId" value={r.id} />
					<div class="campos tres">
						<label>Acuerdo<input name="texto" required /></label>
						<label>Bloque<input name="bloque" placeholder="Próximos pasos" /></label>
						<label>Quién<input name="responsable" /></label>
					</div>
					<button class="chico" type="submit">Agregar</button>
				</form>
			{:else}
				<button class="mas" type="button" onclick={() => (sumar = r.id)}>+ Sumar acuerdo</button>
			{/if}
		</article>
	{/each}
</main>

<style>
	.encabezado{display:flex;align-items:center;gap:24px;flex-wrap:wrap;
		padding:26px 30px 20px;border-bottom:1px solid var(--raya2)}
	h1{font-family:"Bricolage Grotesque",Georgia,serif;font-weight:700;font-size:1.5rem;
		color:var(--tinta);margin:0;letter-spacing:-.02em}
	.sub{font-size:15.5px;color:var(--tenue);margin:4px 0 0}
	.nuevo{margin-left:auto;background:var(--violeta);color:#fff;border:none;cursor:pointer;
		font-size:15px;font-weight:600;padding:11px 20px}
	.franja{display:flex;gap:22px;flex-wrap:wrap;padding:12px 30px;background:var(--franja);
		border-bottom:1px solid var(--raya2);font-size:15px;color:var(--tenue)}
	.franja b{color:var(--tinta)}
	.pend{margin-left:auto;font-family:"DM Mono",monospace;font-size:14px;color:var(--violeta)}

	main{max-width:920px;margin:0 auto;padding:26px 30px 80px}
	.alta,.sumar{border:1px solid var(--raya2);background:var(--hoja);padding:20px 22px;margin-bottom:24px}
	.campos{display:grid;grid-template-columns:180px 1fr;gap:14px}
	.campos.tres{grid-template-columns:2fr 1fr 1fr}
	@media(max-width:700px){.campos,.campos.tres{grid-template-columns:1fr}}
	label{display:block;font-family:"DM Mono",monospace;font-size:12px;letter-spacing:.12em;
		text-transform:uppercase;color:var(--tenue);margin-bottom:13px}
	input,textarea{width:100%;margin-top:6px;padding:9px 11px;border:1px solid var(--raya2);
		background:var(--papel);color:var(--tinta);font-family:Manrope,sans-serif;font-size:15px;
		text-transform:none;letter-spacing:0;line-height:1.5}
	input:focus,textarea:focus{outline:2px solid var(--violeta);outline-offset:-1px}
	.chico{background:var(--violeta);color:#fff;border:none;cursor:pointer;font-size:15px;
		font-weight:600;padding:9px 18px}

	.reunion{border:1px solid var(--raya2);background:var(--hoja);padding:22px 24px 20px;margin-bottom:22px}
	.reunion header{display:flex;align-items:flex-start;gap:20px;flex-wrap:wrap;margin-bottom:14px}
	.fecha{font-family:"DM Mono",monospace;font-size:12.5px;letter-spacing:.1em;text-transform:uppercase;
		color:var(--tenue);margin:0 0 5px}
	.reunion h2{font-family:"Bricolage Grotesque",serif;font-weight:700;font-size:1.3rem;
		color:var(--tinta);margin:0;letter-spacing:-.02em}
	.quienes{font-size:15px;color:var(--texto);margin:7px 0 0;max-width:64ch;line-height:1.5}
	.marcador{margin-left:auto;text-align:right;padding:8px 14px;border:1px solid var(--raya2)}
	.marcador b{font-family:"Bricolage Grotesque",serif;font-size:1.5rem;color:var(--violeta);
		display:block;line-height:1}
	.marcador span{font-family:"DM Mono",monospace;font-size:11.5px;color:var(--tenue)}
	.marcador.full{border-color:var(--violeta);background:var(--violeta-w)}
	.caracter{font-size:15px;line-height:1.6;color:var(--texto);margin:0 0 16px;
		padding-left:14px;border-left:3px solid var(--raya2);max-width:76ch}

	.notas{border:1px solid var(--raya);background:var(--papel);margin-bottom:18px}
	.notas summary{cursor:pointer;padding:11px 15px;font-family:"DM Mono",monospace;font-size:12.5px;
		letter-spacing:.12em;text-transform:uppercase;color:var(--tenue)}
	.notas summary:hover{color:var(--violeta)}
	.cuerpo-notas{padding:6px 18px 16px}
	.cuerpo-notas p{margin:0 0 7px;font-size:15.5px;line-height:1.55;color:var(--texto);max-width:78ch}
	.titulito{font-family:"DM Mono",monospace;font-size:12px;letter-spacing:.13em;
		color:var(--violeta);margin:16px 0 8px}
	.salto{height:6px}

	.bloque{margin-bottom:18px}
	.bloque h3{font-family:"DM Mono",monospace;font-size:12px;letter-spacing:.13em;
		text-transform:uppercase;color:var(--tenue);margin:0 0 9px;padding-bottom:7px;
		border-bottom:1px solid var(--raya)}
	.ac{padding:10px 0 12px;border-bottom:1px solid var(--raya)}
	.ac:last-child{border-bottom:none}
	.tick{display:flex;align-items:flex-start;gap:10px;margin:0 0 5px;text-transform:none;
		letter-spacing:0;font-family:Manrope,sans-serif;cursor:pointer}
	.tick input{width:auto;margin:3px 0 0}
	.t{font-size:15.5px;color:var(--tinta);font-weight:600;line-height:1.4}
	.ac.hecho .t{color:var(--tenue);text-decoration:line-through;
		text-decoration-color:var(--violeta);text-decoration-thickness:1.5px}
	.det{font-size:14.5px;color:var(--tenue);margin:0 0 7px 26px;line-height:1.5}
	.como{margin:0 0 0 26px;width:calc(100% - 26px);font-size:15px;padding:7px 10px}
	.pie-ac{display:flex;align-items:center;gap:12px;margin:8px 0 0 26px}
	.resp{font-family:"DM Mono",monospace;font-size:12px;letter-spacing:.09em;color:var(--pale);
		border:1px solid var(--raya2);padding:2px 7px}
	.mini{background:none;border:1px solid var(--raya2);cursor:pointer;font-size:14px;
		color:var(--tenue);padding:5px 12px;margin-left:auto}
	.mini:hover{color:var(--violeta);border-color:var(--violeta)}
	.mas{background:none;border:1px dashed var(--raya2);cursor:pointer;font-size:14.5px;
		color:var(--tenue);padding:9px 16px;width:100%}
	.mas:hover{color:var(--violeta);border-color:var(--violeta)}
</style>
