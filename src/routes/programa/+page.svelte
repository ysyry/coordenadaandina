<script lang="ts">
	let { data } = $props();

	const ANIO: Record<number, string> = { 1:'1º',2:'1º',3:'2º',4:'2º',5:'3º',6:'3º',7:'4º',8:'4º',9:'5º',10:'5º' };
	const NOMBRE: Record<number, string> = {
		1:'Primer',2:'Segundo',3:'Tercer',4:'Cuarto',5:'Quinto',
		6:'Sexto',7:'Séptimo',8:'Octavo',9:'Noveno',10:'Décimo'
	};
	const CICLO = (c: number) => (c <= 4 ? 'Ciclo Básico Común' : c <= 6 ? 'Enlace Interciclo' : 'Ciclo Orientado');

	let cuatri = $state(3);
	const delCuatri = $derived(data.filas.filter((f) => f.cuatrimestre === cuatri));
	const mat = $derived(delCuatri.filter((f) => f.disciplina === 'matematica'));
	const inf = $derived(delCuatri.filter((f) => f.disciplina === 'informatica'));
	const epa = $derived(delCuatri.filter((f) => f.disciplina === 'epa'));
	const cruces = $derived(data.cruces.filter((c) => c.cuatrimestre === cuatri));
</script>

<svelte:head><title>Areal · el programa del área</title></svelte:head>

<div class="encabezado">
	<div>
		<h1>El programa del área</h1>
		<p class="sede">Lo que prescribe el diseño curricular, cuatrimestre por cuatrimestre</p>
		<p class="fuente">
			{cuatri <= 6
				? 'Saberes textuales de la Res. 1381/22.'
				: 'Redacción propia a partir de la Res. 1578/26.'}
		</p>
	</div>
	<nav class="cuatris" aria-label="Cuatrimestre">
		{#each [1,2,3,4,5,6,7,8,9,10] as c}
			<button type="button" aria-pressed={c === cuatri} onclick={() => (cuatri = c)}>
				C{c} <i>{ANIO[c]}</i>
			</button>
		{/each}
	</nav>
</div>

<main>
	<div class="titulo">
		<h2>{NOMBRE[cuatri]} cuatrimestre · {ANIO[cuatri]} año</h2>
		<span class="ciclo">{CICLO(cuatri)}</span>
	</div>

	<div class="cols" class:tri={epa.length > 0}>
		{#if epa.length}
			<section class="col e">
				<h3>EPA Matemática/Informática</h3>
				{#each epa as f}
					<article class="nudo">
						<span class="cod">{f.codigo}</span>
						<h4>{f.titulo ?? f.nombre}</h4>
						<p>{f.saberes}</p>
					</article>
				{/each}
			</section>
		{/if}
		<section class="col m">
			<h3>Matemática</h3>
			{#each mat as f}
				<article class="nudo" class:repite={f.repite}>
					<span class="cod">{f.codigo}</span>
					<h4>{f.titulo ?? f.nombre}</h4>
					<p>{f.saberes}</p>
				</article>
			{/each}
		</section>
		<section class="col i">
			<h3>Informática</h3>
			{#each inf as f}
				<article class="nudo" class:repite={f.repite}>
					<span class="cod">{f.codigo}</span>
					{#if f.transversal}<span class="chip">transversal</span>{/if}
					<h4>{f.titulo ?? f.nombre}</h4>
					<p>{f.saberes}</p>
				</article>
			{/each}
		</section>
	</div>

	{#if cruces.length}
		<section class="cruces">
			<h3>Se cruzan acá</h3>
			{#each cruces as c}
				<div class="cruce">
					<code>{c.a} × {c.b}</code>
					<div><b>{c.titulo}</b><span>{c.resumen}</span></div>
					{#if !c.escrito}<em>por escribir</em>{/if}
				</div>
			{/each}
		</section>
	{/if}

	<p class="pie">
		{data.filas.length} nudos repartidos en los diez cuatrimestres ·
		Res. 1381/22 para 1º a 3º · Res. 1578/26 para 4º y 5º
	</p>
</main>

<style>
	.encabezado{display:flex;align-items:center;gap:24px;flex-wrap:wrap;
		padding:26px 30px 20px;border-bottom:1px solid var(--raya2)}
	.encabezado h1{font-family:"Bricolage Grotesque",Georgia,serif;font-weight:700;font-size:1.6rem;
		color:var(--tinta);margin:0;letter-spacing:-.02em;font-variation-settings:"wdth" 88}
	
	.sede{font-size:15.5px;color:var(--tenue);margin:4px 0 0}
	.cuatris{display:flex;border:1px solid var(--raya2);margin-left:auto;flex-wrap:wrap}
	.cuatris button{background:var(--hoja);border:none;border-right:1px solid var(--raya2);
		cursor:pointer;font-family:"DM Mono",monospace;font-size:14px;font-weight:500;
		padding:10px 13px;color:var(--tenue);transition:all .12s}
	.cuatris button:last-child{border-right:none}
	.cuatris button:hover{color:var(--tinta);background:var(--violeta-w)}
	.cuatris button[aria-pressed="true"]{background:var(--violeta);color:var(--hoja)}
	.cuatris button i{font-style:normal;opacity:.62;font-size:12.5px}

	main{padding:30px;max-width:1400px;margin:0 auto}
	.titulo{display:flex;align-items:baseline;gap:16px;flex-wrap:wrap;margin-bottom:24px}
	.titulo h2{font-family:"Bricolage Grotesque",Georgia,serif;font-weight:600;font-size:1.5rem;
		color:var(--tinta);margin:0;letter-spacing:-.02em}
	.ciclo{font-family:"DM Mono",monospace;font-size:13px;letter-spacing:.1em;
		text-transform:uppercase;color:var(--tenue)}

	.cols{display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:start}
	.cols.tri{grid-template-columns:1fr 1fr 1fr}
	@media(max-width:1000px){.cols,.cols.tri{grid-template-columns:1fr}}
	.col h3{font-family:"DM Mono",monospace;font-size:12.5px;letter-spacing:.15em;
		text-transform:uppercase;margin:0 0 12px;padding-bottom:9px;border-bottom:2px solid;font-weight:500}
	.col.m h3{color:var(--mat);border-color:var(--mat)}
	.col.i h3{color:var(--inf);border-color:var(--inf)}
	.col.e h3{color:var(--epa);border-color:var(--epa)}

	.nudo{background:var(--hoja);border:1px solid var(--raya);border-left:3px solid;
		padding:14px 16px 15px;margin-bottom:12px;box-shadow:var(--sombra)}
	.col.m .nudo{border-left-color:var(--mat)}
	.col.i .nudo{border-left-color:var(--inf)}
	.col.e .nudo{border-left-color:var(--epa)}
	.nudo.repite{opacity:.6}
	.cod{font-family:"DM Mono",monospace;font-size:12px;font-weight:500;letter-spacing:.04em;
		padding:2px 6px}
	.col.m .cod{background:var(--mat-w);color:var(--mat)}
	.col.i .cod{background:var(--inf-w);color:var(--inf)}
	.col.e .cod{background:var(--epa-w);color:var(--epa)}
	.chip{font-family:"DM Mono",monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;
		color:var(--epa);border:1px solid var(--epa);padding:1px 5px;margin-left:5px}
	.nudo h4{font-family:"Bricolage Grotesque",Georgia,serif;font-weight:600;font-size:1.02rem;
		color:var(--tinta);margin:9px 0 6px;letter-spacing:-.01em}
	.nudo p{margin:0;font-size:15.5px;line-height:1.5}

	.cruces{margin-top:24px;border:1px solid var(--epa);background:var(--epa-w);padding:16px 18px}
	.cruces h3{font-family:"DM Mono",monospace;font-size:12.5px;letter-spacing:.15em;
		text-transform:uppercase;color:var(--epa);margin:0 0 12px;font-weight:500}
	.cruce{display:grid;grid-template-columns:auto 1fr auto;gap:14px;align-items:baseline;
		padding:9px 0;border-bottom:1px solid var(--raya)}
	.cruce:last-child{border-bottom:none}
	.cruce code{font-family:"DM Mono",monospace;font-size:13px;color:var(--tinta);
		white-space:nowrap;font-weight:500}
	.cruce b{color:var(--tinta);font-weight:600;font-size:15px}
	.cruce span{display:block;font-size:15px;color:var(--texto)}
	.cruce em{font-family:"DM Mono",monospace;font-size:11.5px;letter-spacing:.1em;font-style:normal;
		text-transform:uppercase;color:var(--tenue);border:1px solid var(--raya2);padding:2px 6px;
		white-space:nowrap}

	.pie{font-family:"DM Mono",monospace;font-size:12.5px;color:var(--tenue);
		margin-top:36px;padding-top:18px;border-top:1px solid var(--raya)}
	.fuente{font-family:"DM Mono",monospace;font-size:12px;color:var(--pale);margin:8px 0 0;
		max-width:70ch;line-height:1.5}
</style>
