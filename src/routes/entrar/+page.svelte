<script lang="ts">
	import { enhance } from '$app/forms';
	let { data, form } = $props();
</script>

<svelte:head><title>Areal · entrar</title></svelte:head>

<main>
	<div class="caja">
		<p class="marca">Areal</p>
		<h1>Área Matemática e Informática</h1>
		<p class="sub">Provincia del Neuquén</p>

		{#if data.sinUsuarias}
			<p class="vacio">
				Todavía no hay ninguna cuenta creada. Pedísela a quien administra el área.
			</p>
		{:else}
			<form method="POST" use:enhance>
				<label for="email">Correo</label>
				<input
					id="email"
					name="email"
					type="email"
					autocomplete="username"
					value={form?.email ?? ''}
					required
				/>

				<label for="clave">Clave</label>
				<input id="clave" name="clave" type="password" autocomplete="current-password" required />

				{#if form?.error}<p class="error">{form.error}</p>{/if}
				<button type="submit">Entrar</button>
			</form>
		{/if}

		<p class="pie">
			Acá adentro hay horarios, acuerdos y planificaciones del área. La sesión queda abierta
			treinta días en este dispositivo.
		</p>
	</div>
</main>

<style>
	main{min-height:100dvh;display:grid;place-items:center;padding:24px}
	.caja{width:min(420px,100%);background:var(--hoja);border:1px solid var(--raya2);
		box-shadow:var(--sombra);padding:30px 28px 26px}
	.marca{font-family:"DM Mono",monospace;font-size:13px;letter-spacing:.14em;
		text-transform:uppercase;color:var(--violeta);margin:0 0 10px}
	h1{font-family:"Bricolage Grotesque",Georgia,serif;font-weight:700;font-size:1.45rem;
		color:var(--tinta);margin:0;letter-spacing:-.02em;line-height:1.2}
	.sub{font-size:15px;color:var(--tenue);margin:6px 0 24px}
	form{display:flex;flex-direction:column;gap:7px}
	label{font-size:14px;font-weight:600;color:var(--tinta);margin-top:6px}
	input{font:inherit;font-size:16px;padding:11px 13px;background:var(--papel);
		color:var(--texto);border:1px solid var(--raya2)}
	input:focus-visible{outline:2px solid var(--violeta);outline-offset:1px}
	button{margin-top:14px;background:var(--violeta);color:#fff;border:none;cursor:pointer;
		font-size:15.5px;font-weight:600;padding:12px 20px}
	.error{margin:8px 0 0;font-size:14.5px;color:var(--inf)}
	.vacio{font-size:15px;color:var(--texto);background:var(--franja);
		border-left:3px solid var(--violeta);padding:12px 14px;margin:0}
	.vacio code{font-family:"DM Mono",monospace;font-size:14px}
	.pie{margin:22px 0 0;font-size:13.5px;line-height:1.5;color:var(--pale)}
</style>
