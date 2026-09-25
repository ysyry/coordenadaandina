<script lang="ts">
	import { enhance } from '$app/forms';
	let { data } = $props();
	let abrir = $state(false);
	let viendo = $state<(typeof data.recursos)[number] | null>(null);
	const de = (c: string) => data.recursos.filter((r) => r.categoria === c);
	/** Lo que Areal guarda en su propia base se puede abrir acá adentro. */
	const propio = (r: { enlace: string }) => r.enlace.startsWith('/docs/');
</script>

<svelte:head><title>Areal · recursero</title></svelte:head>

<div class="encabezado">
	<div>
		<h1>Recursero</h1>
		<p class="sub">Lo que el área necesita tener a mano.</p>
	</div>
	<button class="nuevo" type="button" onclick={() => (abrir = !abrir)}>
		{abrir ? 'Cancelar' : '+ Agregar'}
	</button>
</div>

<main>
	{#if abrir}
		<form class="alta" method="POST" action="?/agregar" use:enhance={() => async ({ update }) => {
			abrir = false; await update({ reset: true }); }}>
			<div class="campos">
				<label>Título<input name="titulo" required /></label>
				<label>Dónde va
					<select name="categoria">
						{#each data.categorias as c}<option value={c.id}>{c.rot}</option>{/each}
					</select>
				</label>
				<label>Formato
					<select name="formato">
						{#each ['pdf','docx','web','app','video','audio','imagen'] as f}<option>{f}</option>{/each}
					</select>
				</label>
			</div>
			<label>Qué es<textarea name="descripcion" rows="2"></textarea></label>
			<div class="campos dos">
				<label>Enlace<input name="enlace" placeholder="https://…" /></label>
				<label>De dónde sale<input name="fuente" /></label>
			</div>
			<button class="chico" type="submit">Guardar</button>
		</form>
	{/if}

	{#each data.categorias as c}
		{@const items = de(c.id)}
		{#if items.length}
			<section>
				<h2>{c.rot}</h2>
				<p class="ayuda">{c.ayuda}</p>
				<div class="lista">
					{#each items as r}
						<article class="rec {c.id}">
							<div class="r-h">
								<span class="fmt">{r.formato}</span>
								{#if r.enlace}
									<h3><a href={r.enlace} target="_blank" rel="noopener">{r.titulo}</a></h3>
								{:else}
									<h3>{r.titulo}</h3>
								{/if}
								<form method="POST" action="?/borrar" use:enhance>
									<input type="hidden" name="id" value={r.id} />
									<button class="x" type="submit" aria-label="Borrar">×</button>
								</form>
							</div>
							{#if r.descripcion}<p class="d">{r.descripcion}</p>{/if}
							<div class="pie-rec">
								{#if propio(r)}
									<button class="ver" type="button" onclick={() => (viendo = r)}>Ver acá</button>
								{/if}
								<p class="f">
									{#if r.enlace && !propio(r)}<a href={r.enlace} target="_blank" rel="noopener">{r.enlace.replace(/^https?:\/\//,'')}</a>{/if}
									{#if r.enlace && !propio(r) && r.fuente} · {/if}
									{#if r.fuente}{r.fuente}{/if}
								</p>
							</div>
						</article>
					{/each}
				</div>
			</section>
		{/if}
	{/each}

	<p class="pie">
		Los que dicen <b>Ver acá</b> se abren dentro de Areal. El resto son referencias: los PDF de
		la normativa están en <code>normativa/</code> y los papeles de la escuela, en el Drive.
		Los papeles institucionales no se publican: quedan en el Drive de la escuela.
	</p>
</main>

{#if viendo}
	<div class="visor" role="dialog" aria-modal="true" aria-label={viendo.titulo}>
		<div class="v-b">
			<h2>{viendo.titulo}</h2>
			<a class="descargar" href={viendo.enlace} download>Descargar</a>
			<button class="cerrar" type="button" onclick={() => (viendo = null)}>Cerrar</button>
		</div>
		<div class="v-c">
			{#if viendo.formato === 'imagen'}
				<img src={viendo.enlace} alt={viendo.titulo} />
			{:else if viendo.formato === 'audio'}
				<div class="audio">
					<p>{viendo.descripcion}</p>
					<!-- svelte-ignore a11y_media_has_caption -->
					<audio controls src={viendo.enlace}></audio>
				</div>
			{:else}
				<iframe src={viendo.enlace} title={viendo.titulo}></iframe>
			{/if}
		</div>
	</div>
{/if}

<style>
	.encabezado{display:flex;align-items:center;gap:24px;flex-wrap:wrap;
		padding:26px 30px 20px;border-bottom:1px solid var(--raya2)}
	h1{font-family:"Bricolage Grotesque",Georgia,serif;font-weight:700;font-size:1.5rem;
		color:var(--tinta);margin:0;letter-spacing:-.02em}
	.sub{font-size:15.5px;color:var(--tenue);margin:4px 0 0}
	.nuevo{margin-left:auto;background:var(--violeta);color:#fff;border:none;cursor:pointer;
		font-size:15px;font-weight:600;padding:11px 20px}
	.nuevo:hover{opacity:.87}
	main{max-width:1060px;margin:0 auto;padding:26px 30px 80px}
	section{margin-bottom:40px}
	h2{font-family:"Bricolage Grotesque",serif;font-weight:600;font-size:1.2rem;color:var(--tinta);
		margin:0 0 5px;letter-spacing:-.018em}
	.ayuda{font-size:15px;color:var(--tenue);margin:0 0 16px;max-width:74ch;line-height:1.5}

	.alta{border:1px solid var(--raya2);background:var(--hoja);padding:20px 22px;margin-bottom:32px}
	.campos{display:grid;grid-template-columns:2fr 1fr 1fr;gap:14px}
	.campos.dos{grid-template-columns:1fr 1fr}
	@media(max-width:760px){.campos,.campos.dos{grid-template-columns:1fr}}
	label{display:block;font-family:"DM Mono",monospace;font-size:12px;letter-spacing:.12em;
		text-transform:uppercase;color:var(--tenue);margin-bottom:13px}
	input,select,textarea{width:100%;margin-top:6px;padding:9px 11px;border:1px solid var(--raya2);
		background:var(--papel);color:var(--tinta);font-family:Manrope,sans-serif;font-size:15px;
		text-transform:none;letter-spacing:0;line-height:1.45}
	input:focus,select:focus,textarea:focus{outline:2px solid var(--violeta);outline-offset:-1px}
	.chico{background:var(--violeta);color:#fff;border:none;cursor:pointer;font-size:15px;
		font-weight:600;padding:9px 18px}

	.lista{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px}
	.rec{background:var(--hoja);border:1px solid var(--raya);border-left:3px solid var(--raya2);
		padding:14px 16px 15px;box-shadow:var(--sombra);
		display:flex;flex-direction:column}
	.rec .d{flex:1}
	.pie-rec{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:auto}
	.ver{background:var(--violeta);color:#fff;border:none;cursor:pointer;font-size:14px;
		font-weight:600;padding:6px 13px;white-space:nowrap}
	.ver:hover{opacity:.87}
	.rec.institucional{border-left-color:var(--epa)}
	.rec.normativa{border-left-color:var(--mat)}
	.rec.app{border-left-color:var(--violeta)}
	.rec.herramienta{border-left-color:var(--inf)}
	.r-h{display:flex;align-items:baseline;gap:10px;margin-bottom:7px}
	.fmt{font-family:"DM Mono",monospace;font-size:11px;letter-spacing:.11em;text-transform:uppercase;
		color:var(--tenue);border:1px solid var(--raya2);padding:2px 6px;white-space:nowrap}
	.r-h h3{font-family:"Bricolage Grotesque",serif;font-weight:600;font-size:1.02rem;
		color:var(--tinta);margin:0;letter-spacing:-.012em;flex:1;line-height:1.3}
	.r-h h3 a{color:inherit;text-decoration:none}
	.r-h h3 a:hover{text-decoration:underline;text-decoration-color:var(--violeta)}
	.x{background:none;border:none;cursor:pointer;color:var(--pale);font-size:18px;line-height:1}
	.x:hover{color:var(--inf)}
	.d{font-size:15px;line-height:1.5;margin:0 0 12px;color:var(--texto)}
	.f{font-family:"DM Mono",monospace;font-size:12.5px;color:var(--tenue);margin:0;word-break:break-all}
	.f a{color:var(--violeta)}
	.pie{font-size:15px;color:var(--tenue);margin-top:30px;padding-top:20px;
		border-top:1px solid var(--raya);line-height:1.6}
	code{font-family:"DM Mono",monospace;font-size:14px;background:var(--franja);padding:1px 5px}

	.visor{position:fixed;inset:0;z-index:70;background:var(--papel);display:flex;flex-direction:column}
	.v-b{display:flex;align-items:center;gap:16px;flex-wrap:wrap;padding:16px 26px;
		border-bottom:1px solid var(--raya2);background:var(--papel)}
	.v-b h2{font-family:"Bricolage Grotesque",serif;font-size:1.2rem;color:var(--tinta);margin:0;
		letter-spacing:-.018em;flex:1}
	.descargar{font-family:"DM Mono",monospace;font-size:13.5px;color:var(--tenue);
		text-decoration:none;border:1px solid var(--raya2);padding:8px 14px}
	.descargar:hover{color:var(--violeta);border-color:var(--violeta)}
	.cerrar{background:var(--violeta);color:#fff;border:none;cursor:pointer;font-size:15.5px;
		font-weight:600;padding:9px 18px}
	.v-c{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;
		background:var(--franja);padding:0}
	.v-c iframe{width:100%;height:100%;border:none;background:#fff}
	.v-c img{max-width:100%;max-height:100%;object-fit:contain}
	.audio{text-align:center;padding:40px 30px;max-width:60ch}
	.audio p{font-size:15px;line-height:1.6;color:var(--texto);margin:0 0 22px}
	.audio audio{width:100%}
</style>
