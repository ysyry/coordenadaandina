<script lang="ts">
	import Texto from './Texto.svelte';
	/** Para qué es la encuesta: lo primero que se lee, en cualquiera de ellas. */
	let { texto }: { texto: string } = $props();
</script>

{#if texto.trim()}
	<section class="motivacion">
		<span class="rot">Motivación</span>
		{#each texto.trim().split(/\n\s*\n/) as parrafo}<p><Texto texto={parrafo} /></p>{/each}
	</section>
{/if}

<style>
	.motivacion{border-left:3px solid var(--violeta);padding:2px 0 2px 16px;margin:0 0 20px}
	.rot{font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:var(--violeta);font-weight:600}
	p{margin:4px 0 0;max-width:68ch;font-size:15px;color:var(--texto);line-height:1.55;white-space:pre-line}
</style>
