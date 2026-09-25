<script lang="ts">
	import { enhance } from '$app/forms';
	let { data, form } = $props();

	/** Los dictados agrupados por año, que es como se piensa el horario. */
	const porAnio = $derived.by(() => {
		const m = new Map<number, typeof data.dictados>();
		for (const d of data.dictados) m.set(d.anio, [...(m.get(d.anio) ?? []), d]);
		return [...m.entries()].sort(([a], [b]) => a - b);
	});
	/* Se marca acá y no en el servidor para que el rol aparezca al tildar y la
	   cuenta se mueva sola, sin recargar. */
	let marcados = $state<Record<string, boolean>>(
		Object.fromEntries(data.dictados.map((d) => [d.id, !!d.rol || d.porPuesto]))
	);
	const cuantos = $derived(data.dictados.filter((d) => marcados[d.id]).length);
	let sumando = $state(false);
</script>

<svelte:head><title>Areal · mi perfil</title></svelte:head>

<header>
	<div>
		<h1>Mi perfil</h1>
		<p class="sede">{data.yo.nombre}{data.yo.admin ? ' · administra' : ''}</p>
	</div>
</header>

<main>
	{#if form?.error}<p class="error">{form.error}</p>{/if}

	<section class="tarjeta">
		<h2>Quién soy acá</h2>
		<p class="ayuda">El nombre con el que firmás lo que cargás: reuniones, acuerdos, eventos.</p>
		<form method="POST" action="?/nombre" use:enhance class="linea">
			<label for="nombre">Nombre</label>
			<input id="nombre" name="nombre" value={data.yo.nombre} required />
			<button type="submit">Guardar</button>
		</form>
		<p class="pie">
			Entrás con <code>{data.yo.email}</code>. Ese correo no se cambia desde acá: pedíselo a
			quien administra.
		</p>
		{#if form?.hecho === 'nombre'}<p class="ok">Listo.</p>{/if}
	</section>

	<section class="tarjeta">
		<h2>Lo que doy</h2>
		<p class="ayuda">
			Marcá cada materia y año que dictás. De acá sale a quién le toca cada cosa: las
			planificaciones, los formularios por materia y los cruces del calendario.
			{#if cuantos}Tenés {cuantos === 1 ? 'uno marcado' : `${cuantos} marcados`}.{/if}
		</p>

		<form method="POST" action="?/dictados" use:enhance class="dicta">
			{#each porAnio as [anio, ds]}
				<p class="anio">{anio}º año</p>
				<div class="dictados">
					{#each ds as d}
						<label class="dic" class:on={marcados[d.id]} class:fijo={d.porPuesto}>
							<input type="checkbox" name="dictado" value={d.id}
								checked={marcados[d.id]} disabled={d.porPuesto}
								onchange={(e) => (marcados[d.id] = e.currentTarget.checked)} />
							<span class="dic-t">
								<b>{d.espacio}</b>
								{#if d.porPuesto}
									<i>viene de tu puesto</i>
								{:else if marcados[d.id]}
									<select name="rol.{d.id}" aria-label="Rol en {d.nombre}">
										{#each data.roles as r}
											<option value={r} selected={(d.rol ?? 'titular') === r}>{r}</option>
										{/each}
									</select>
								{/if}
							</span>
						</label>
					{/each}
				</div>
			{/each}
			<button type="submit">Guardar</button>
			{#if form?.hecho === 'dictados'}<span class="ok">Listo.</span>{/if}
		</form>

		{#if sumando}
			<form method="POST" action="?/declarar" class="declarar"
				use:enhance={() => async ({ update }) => { sumando = false; await update(); }}>
				<p class="rot">Algo que das y no está en el horario cargado</p>
				<div class="campos">
					<label>Año
						<select name="cursoId" required>
							{#each data.cursos as c}<option value={c.id}>{c.anio}º año</option>{/each}
						</select>
					</label>
					<label>Espacio
						<select name="espacioEscuelaId" required>
							{#each data.espacios as e}
								<option value={e.id}>{e.rama ? `${e.nombre} · rama ${e.rama}` : e.nombre}</option>
							{/each}
						</select>
					</label>
					<button type="submit">Sumar</button>
					<button type="button" class="flojo" onclick={() => (sumando = false)}>Cancelar</button>
				</div>
			</form>
		{:else}
			<button type="button" class="flojo" onclick={() => (sumando = true)}>
				Falta algo que doy
			</button>
		{/if}
	</section>

	<section class="tarjeta">
		<h2>Correos para avisos</h2>
		<p class="ayuda">
			A estos correos van los avisos del área. Van aparte del de acceso: con aquel entrás, a
			estos se te escribe. Podés poner el personal, el institucional, los dos.
		</p>

		{#if data.avisos.length}
			<ul class="correos">
				{#each data.avisos as a}
					<li>
						<code>{a.email}</code>
						<form method="POST" action="?/avisoBaja" use:enhance>
							<input type="hidden" name="id" value={a.id} />
							<button class="x" type="submit" aria-label="Sacar {a.email}">×</button>
						</form>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="vacio">Todavía no cargaste ninguno. Sin esto, los avisos no te llegan.</p>
		{/if}

		<form method="POST" action="?/avisoAlta" class="linea"
			use:enhance={() => async ({ update }) => { await update({ reset: true }); }}>
			<label for="email">Sumar un correo</label>
			<input id="email" name="email" type="email" placeholder="otro@correo" required />
			<button type="submit">Sumar</button>
		</form>
		<p class="pie">
			Por ahora los avisos no se mandan solos: la lista queda guardada para cuando se
			enchufe el envío.
		</p>
	</section>

	<section class="tarjeta">
		<h2>Cambiar la clave</h2>
		<p class="ayuda">Al menos diez caracteres. Pide la actual, así no alcanza con encontrar
			la sesión abierta.</p>
		<form method="POST" action="?/clave" use:enhance class="claves">
			<label>Clave actual
				<input name="actual" type="password" autocomplete="current-password" required />
			</label>
			<label>Clave nueva
				<input name="nueva" type="password" autocomplete="new-password" minlength="10" required />
			</label>
			<label>Repetila
				<input name="repite" type="password" autocomplete="new-password" minlength="10" required />
			</label>
			<button type="submit">Cambiar</button>
			{#if form?.hecho === 'clave'}<span class="ok">Clave cambiada.</span>{/if}
		</form>
	</section>
</main>

<style>
	header{display:flex;gap:24px;align-items:flex-end;flex-wrap:wrap;
		padding:26px 30px 20px;border-bottom:1px solid var(--raya2)}
	h1{font-family:"Bricolage Grotesque",Georgia,serif;font-weight:700;font-size:1.5rem;
		color:var(--tinta);margin:0;letter-spacing:-.02em}
	.sede{font-size:15.5px;color:var(--tenue);margin:4px 0 0}

	main{max-width:760px;margin:0 auto;padding:24px 30px 80px;display:flex;
		flex-direction:column;gap:14px}
	.tarjeta{background:var(--hoja);border:1px solid var(--raya);padding:18px 20px 20px}
	h2{font-family:"Bricolage Grotesque",Georgia,serif;font-weight:600;font-size:1.15rem;
		color:var(--tinta);margin:0 0 6px;letter-spacing:-.018em}
	.ayuda{font-size:14.5px;color:var(--tenue);margin:0 0 14px;line-height:1.5;max-width:62ch}
	.pie{font-size:13.5px;color:var(--pale);margin:14px 0 0;line-height:1.5;max-width:64ch}
	.pie.aviso{color:var(--inf)}
	.pie b{color:var(--tinta)}
	.vacio{font-size:14.5px;color:var(--tenue);background:var(--franja);
		border-left:3px solid var(--raya2);padding:10px 13px;margin:0 0 12px}
	.error{font-size:15px;color:#fff;background:var(--inf);padding:11px 14px;margin:0}
	.ok{font-size:13.5px;color:var(--mat)}

	.linea{display:flex;gap:9px;align-items:center;flex-wrap:wrap}
	.linea label{font-size:14px;font-weight:600;color:var(--tinta)}
	.linea input{flex:1 1 220px;min-width:0}
	input{font:inherit;font-size:15px;padding:9px 11px;background:var(--papel);
		color:var(--texto);border:1px solid var(--raya2)}
	input:focus-visible{outline:2px solid var(--violeta);outline-offset:-1px}
	button{background:var(--violeta);color:#fff;border:none;cursor:pointer;
		font:inherit;font-size:15px;font-weight:600;padding:9px 18px}
	button:hover{opacity:.88}

	.anio{font-family:"DM Mono",monospace;font-size:11.5px;letter-spacing:.13em;
		text-transform:uppercase;color:var(--pale);margin:14px 0 6px}
	.anio:first-of-type{margin-top:0}
	.dictados{display:flex;gap:8px;flex-wrap:wrap}
	/* El botón cierra la lista: sin aire se lee como parte del último año. */
	.dicta button{margin-top:20px}
	.dicta .ok{margin-left:10px}
	.dic{display:inline-flex;align-items:flex-start;gap:8px;cursor:pointer;
		border:1px solid var(--raya2);background:var(--papel);padding:9px 13px}
	.dic.on{border-color:var(--violeta);background:var(--violeta-w)}
	.dic.fijo{cursor:default;opacity:.85}
	.dic input{width:auto;margin:2px 0 0;padding:0}
	.dic-t{display:flex;flex-direction:column;gap:4px}
	.dic-t b{font-size:15px;font-weight:600;color:var(--tinta)}
	.dic-t i{font-style:normal;font-size:12px;color:var(--pale)}
	.dic-t select{font:inherit;font-size:12.5px;padding:2px 5px;background:var(--hoja);
		color:var(--tenue);border:1px solid var(--raya2)}
	.declarar{margin-top:16px;border-top:1px solid var(--raya);padding-top:14px}
	.declarar .rot{font-family:"DM Mono",monospace;font-size:11.5px;letter-spacing:.13em;
		text-transform:uppercase;color:var(--pale);margin:0 0 9px}
	.declarar .campos{display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end}
	.declarar label{display:flex;flex-direction:column;gap:5px;font-size:14px;font-weight:600;
		color:var(--tinta)}
	.declarar select{font:inherit;font-size:15px;padding:9px 11px;background:var(--papel);
		color:var(--texto);border:1px solid var(--raya2)}
	.flojo{background:none;color:var(--tenue);border:1px solid var(--raya2);
		font-weight:500;margin-top:14px}
	.flojo:hover{color:var(--violeta);border-color:var(--violeta);opacity:1}
	.declarar .flojo{margin-top:0}

	.correos{list-style:none;margin:0 0 14px;padding:0;display:flex;flex-direction:column;gap:6px}
	.correos li{display:flex;align-items:center;gap:10px;background:var(--papel);
		border:1px solid var(--raya);padding:7px 9px 7px 12px}
	.correos code{font-family:"DM Mono",monospace;font-size:14px;color:var(--tinta);flex:1;
		overflow-wrap:anywhere}
	.x{background:none;border:none;color:var(--tenue);font-size:20px;line-height:1;
		padding:2px 8px;cursor:pointer}
	.x:hover{color:var(--inf)}
	code{font-family:"DM Mono",monospace;font-size:13.5px;color:var(--tinta)}

	.claves{display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end}
	.claves label{display:flex;flex-direction:column;gap:5px;font-size:14px;font-weight:600;
		color:var(--tinta);flex:1 1 180px}
	.claves input{font-weight:400}
</style>
