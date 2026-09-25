<script lang="ts">
	/**
	 * Texto de una encuesta con links escritos como [texto](https://…).
	 * Todo lo demás se muestra tal cual: no se interpreta HTML.
	 */
	let { texto }: { texto: string } = $props();
	const partes = $derived.by(() => {
		const out: { t: string; href?: string }[] = [];
		const re = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
		let i = 0;
		for (const m of texto.matchAll(re)) {
			if (m.index! > i) out.push({ t: texto.slice(i, m.index) });
			out.push({ t: m[1], href: m[2] });
			i = m.index! + m[0].length;
		}
		if (i < texto.length) out.push({ t: texto.slice(i) });
		return out;
	});
</script>

{#each partes as p}{#if p.href}<a href={p.href} target="_blank" rel="noopener noreferrer">{p.t}</a>{:else}{p.t}{/if}{/each}

<style>
	a{color:var(--violeta)}
</style>
