<script lang="ts">
	import { enhance } from '$app/forms';
	let { data, form } = $props();
	let abrir = $state(false);
	let cambiando = $state<string | null>(null);

	const fecha = (d: string | Date | null) =>
		d ? new Date(d).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' }) : null;
</script>

<svelte:head><title>Areal · usuarias</title></svelte:head>

<div class="encabezado">
	<div>
		<h1>Quiénes entran</h1>
		<p class="sub">Las cuentas del área. No hay registro abierto: se dan de alta acá.</p>
	</div>
	<button class="nuevo" type="button" onclick={() => (abrir = !abrir)}>
		{abrir ? 'Cancelar' : '+ Sumar a alguien'}
	</button>
</div>

<main>
	{#if form?.error}<p class="aviso mal">{form.error}</p>{/if}
	{#if form?.hecho}<p class="aviso bien">{form.hecho}</p>{/if}

	{#if abrir}
		<form method="POST" action="?/alta" use:enhance class="alta">
			<div class="campos">
				<label for="nombre">Nombre</label>
				<input id="nombre" name="nombre" type="text" required />
				<label for="email">Correo</label>
				<input id="email" name="email" type="email" required />
				<label for="clave">Clave inicial</label>
				<input id="clave" name="clave" type="text" required minlength="10" />
			</div>
			<label class="chk"><input type="checkbox" name="admin" value="sí" /> Puede dar de alta a las demás</label>
			<p class="nota">
				La clave se la pasás por el grupo del área y ella la cambia cuando quiera. Mínimo diez
				caracteres.
			</p>
			<button type="submit">Dar de alta</button>
		</form>
	{/if}

	<ul class="gente">
		{#each data.usuarias as u}
			<li class:baja={!u.activa}>
				<div class="quien">
					<span class="n">{u.nombre}{#if u.id === data.yo} · vos{/if}</span>
					<span class="mail">{u.email}</span>
					<span class="mono">
						{#if u.admin}administra · {/if}
						{fecha(u.ultimoIngreso) ? `último ingreso ${fecha(u.ultimoIngreso)}` : 'nunca entró'}
					</span>
				</div>

				<div class="acciones">
					<button type="button" class="chico" onclick={() => (cambiando = cambiando === u.id ? null : u.id)}>
						Cambiar clave
					</button>
					{#if u.id !== data.yo}
						<form method="POST" action="?/estado" use:enhance>
							<input type="hidden" name="id" value={u.id} />
							<input type="hidden" name="activa" value={u.activa ? 'no' : 'sí'} />
							<button type="submit" class="chico">{u.activa ? 'Dar de baja' : 'Reactivar'}</button>
						</form>
					{/if}
				</div>

				{#if cambiando === u.id}
					<form method="POST" action="?/clave" use:enhance class="reclave">
						<input type="hidden" name="id" value={u.id} />
						<input name="clave" type="text" placeholder="Clave nueva" required minlength="10" />
						<button type="submit" class="chico">Guardar</button>
					</form>
				{/if}
			</li>
		{/each}
	</ul>
</main>

<style>
	.encabezado{display:flex;align-items:center;gap:24px;flex-wrap:wrap;
		padding:26px 30px 20px;border-bottom:1px solid var(--raya2)}
	h1{font-family:"Bricolage Grotesque",Georgia,serif;font-weight:700;font-size:1.5rem;
		color:var(--tinta);margin:0;letter-spacing:-.02em}
	.sub{font-size:15.5px;color:var(--tenue);margin:4px 0 0}
	.nuevo{margin-left:auto;background:var(--violeta);color:#fff;border:none;cursor:pointer;
		font-size:15px;font-weight:600;padding:11px 20px}
	main{max-width:820px;margin:0 auto;padding:24px 30px 80px}
	.aviso{font-size:14.5px;padding:10px 14px;margin:0 0 16px;border-left:3px solid}
	.aviso.mal{border-color:var(--inf);background:var(--inf-w);color:var(--tinta)}
	.aviso.bien{border-color:var(--mat);background:var(--mat-w);color:var(--tinta)}
	.alta{border:1px solid var(--raya2);background:var(--hoja);padding:20px 22px;margin-bottom:22px}
	.campos{display:grid;grid-template-columns:130px 1fr;gap:12px;align-items:center}
	.campos label{font-size:14.5px;font-weight:600;color:var(--tinta)}
	input[type=text],input[type=email]{font:inherit;font-size:15px;padding:9px 11px;
		background:var(--papel);color:var(--texto);border:1px solid var(--raya2);width:100%}
	.chk{display:flex;gap:8px;align-items:center;font-size:14.5px;margin-top:14px;cursor:pointer}
	.nota{font-size:13.5px;color:var(--pale);margin:10px 0 14px;max-width:56ch}
	.alta button[type=submit]{background:var(--violeta);color:#fff;border:none;cursor:pointer;
		font-size:15px;font-weight:600;padding:10px 20px}
	.gente{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}
	.gente li{border:1px solid var(--raya);background:var(--hoja);padding:13px 16px;
		display:flex;gap:16px;align-items:center;flex-wrap:wrap}
	.gente li.baja{opacity:.55}
	.quien{display:flex;flex-direction:column;gap:2px}
	.n{font-size:15.5px;color:var(--tinta);font-weight:600}
	.mail{font-size:14px;color:var(--tenue)}
	.mono{font-family:"DM Mono",monospace;font-size:12px;color:var(--pale)}
	.acciones{margin-left:auto;display:flex;gap:8px;align-items:center}
	.chico{background:none;border:1px solid var(--raya2);cursor:pointer;font:inherit;
		font-size:13px;color:var(--tenue);padding:5px 11px}
	.chico:hover{color:var(--violeta);border-color:var(--violeta)}
	.reclave{flex-basis:100%;display:flex;gap:8px;padding-top:8px}
	.reclave input{max-width:280px}
</style>
