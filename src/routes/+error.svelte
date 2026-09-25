<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head><title>Areal · {page.status}</title></svelte:head>

<main>
	<p class="num">{page.status}</p>
	<h1>
		{#if page.status === 404}
			Esa página no existe
		{:else if page.status === 403}
			Esta parte no es para vos
		{:else}
			Algo se rompió
		{/if}
	</h1>
	<p class="que">{page.error?.message ?? 'No hay más detalle.'}</p>
	<a href="/">Volver a la portada</a>
</main>

<style>
	main{min-height:60dvh;display:grid;place-content:center;justify-items:start;
		gap:10px;padding:60px 30px;max-width:620px;margin:0 auto}
	.num{font-family:"DM Mono",monospace;font-size:13px;color:var(--violeta);margin:0;
		letter-spacing:.12em}
	h1{font-family:"Bricolage Grotesque",Georgia,serif;font-weight:700;font-size:1.8rem;
		color:var(--tinta);margin:0;letter-spacing:-.02em}
	.que{font-size:16px;color:var(--tenue);margin:0}
	a{margin-top:14px;color:var(--violeta);font-weight:600}
</style>
