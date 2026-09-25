<script lang="ts">
	import { enhance } from '$app/forms';
	let { data } = $props();

	const NOMBRE: Record<number, string> = { 1:'Primer',2:'Segundo',3:'Tercer',4:'Cuarto',5:'Quinto',
		6:'Sexto',7:'Séptimo',8:'Octavo',9:'Noveno',10:'Décimo' };
	const ANIO = (c: number) => ['1º','1º','2º','2º','3º','3º','4º','4º','5º','5º'][c - 1];
	const disc = (d: string) => (d === 'matematica' ? 'm' : d === 'informatica' ? 'i' : 'e');

	let abrir = $state(false);
	let elegidos = $state<string[]>([]);
	const disciplinasElegidas = $derived(
		new Set(elegidos.map((id) => data.nudos.find((n) => n.id === id)?.disciplina))
	);
	const seraEpa = $derived(disciplinasElegidas.size > 1);
</script>

<svelte:head><title>Areal · EPA</title></svelte:head>

<div class="encabezado">
	<div>
		<h1>Espacios Pedagógicos Articulados</h1>
		<p class="sub">Donde las dos disciplinas trabajan el mismo problema.</p>
	</div>
	<button class="nuevo" type="button" onclick={() => (abrir = !abrir)}>
		{abrir ? 'Cancelar' : '+ Nuevo EPA'}
	</button>
</div>

<main>
	{#if abrir}
		<form class="alta" method="POST" action="?/crear" use:enhance={() => async ({ update }) => {
			elegidos = []; abrir = false; await update({ reset: true }); }}>
			<div class="campos">
				<label>Nombre<input name="nombre" required placeholder="Datos en el Territorio" /></label>
				<label>Curso
					<select name="cursoId">
						<option value="">Interárea</option>
						{#each data.cursos as c}<option value={c.id}>{c.etiqueta}</option>{/each}
					</select>
				</label>
				<label>Cuatrimestre
					<select name="cuatrimestre">
						{#each [1,2,3,4,5,6,7,8,9,10] as c}<option value={c}>C{c} · {ANIO(c)}</option>{/each}
					</select>
				</label>
				<label>Estado
					<select name="estado">
						<option value="idea">Idea</option>
						<option value="en curso">En curso</option>
						<option value="cerrado">Cerrado</option>
					</select>
				</label>
			</div>
			<label>El problema<textarea name="problema" rows="3"
				placeholder="Qué se les propone. El conocimiento tiene que aparecer como necesidad de resolverlo."></textarea></label>
			<label>Con quién<input name="conQuien" placeholder="Matemática · 3º año" /></label>

			<p class="rot">Qué nudos pone en juego</p>
			<div class="pick">
				{#each data.nudos.filter((n) => n.disciplina !== 'epa') as n}
					<label class="chk {disc(n.disciplina)}" class:on={elegidos.includes(n.id)}>
						<input type="checkbox" name="nudos" value={n.id} bind:group={elegidos} />
						<b>{n.codigo}</b> {n.nombre}
					</label>
				{/each}
			</div>
			<p class="aviso" class:si={seraEpa}>
				{#if seraEpa}
					Toca las dos disciplinas: <b>es un EPA</b>. No hay casilla que tildar, sale de los nudos.
				{:else}
					Con nudos de una sola disciplina todavía no es un EPA.
				{/if}
			</p>
			<button class="add" type="submit">Crear</button>
		</form>
	{/if}

	<section>
		<h2>Los EPA del área</h2>
		{#if !data.epas.length}
			<p class="nada">Todavía no hay ninguno cargado.</p>
		{/if}
		<div class="lista">
			{#each data.epas as e}
				<article class="epa" class:cruza={e.cruza}>
					<div class="e-h">
						<h3><a href="/epa/{e.id}">{e.nombre}</a></h3>
						{#if e.cruza}<span class="sello">EPA</span>{/if}
						<span class="est {e.estado.replace(' ','-')}">{e.estado}</span>
						<form method="POST" action="?/borrar" use:enhance>
							<input type="hidden" name="id" value={e.id} />
							<button class="x" type="submit" aria-label="Borrar">×</button>
						</form>
					</div>
					<p class="meta">
						{e.curso}{#if e.cuatrimestre} · {NOMBRE[e.cuatrimestre]} cuatrimestre{/if}
						{#if e.docentes} · {e.docentes}{/if}
					</p>
					{#if e.proposito}<p class="prob">{e.proposito.slice(0,240)}{e.proposito.length > 240 ? '…' : ''}</p>{/if}
					<div class="chips">
						{#each e.nudos as n}<span class="chip {disc(n.disciplina)}">{n.codigo}</span>{/each}
					</div>
				</article>
			{/each}
		</div>
	</section>

	<section>
		<h2>El EPA como espacio curricular</h2>
		<p class="ayuda">En 4º y 5º el cruce deja de ser un vínculo entre nudos y pasa a tener
			espacio propio, con sus tres nudos definidos por la Res. 1044/19 y sus saberes por la 1578/26.</p>
		<div class="lista">
			{#each data.nudosEpa as n}
				<article class="epa curricular">
					<div class="e-h">
						<span class="chip e">{n.codigo}</span>
						<h3>{n.titulo ?? n.nombre}</h3>
						<span class="est">C{n.cuatrimestre} · {n.anio}º año</span>
					</div>
					<p class="prob">{n.saberes}</p>
				</article>
			{/each}
		</div>
	</section>

	<section>
		<h2>Materia prima: los cruces prescriptos</h2>
		<p class="ayuda">En el Ciclo Básico no hay espacio propio, pero la secuenciación ya alinea
			nudos de las dos disciplinas en el mismo cuatrimestre. Cada uno es un EPA posible.</p>
		<div class="cruces">
			{#each data.cruces as x}
				<div class="cr">
					<code><span class="cm">{x.a}</span> × <span class="ci">{x.b}</span></code>
					<span class="cq">C{x.c} · {ANIO(x.c)}</span>
					<span><b>{x.titulo}</b> — {x.resumen}</span>
					{#if !x.escrito}<em>por escribir</em>{/if}
				</div>
			{/each}
		</div>
	</section>
</main>

<style>
	.encabezado{display:flex;align-items:center;gap:24px;flex-wrap:wrap;
		padding:26px 30px 20px;border-bottom:1px solid var(--raya2)}
	h1{font-family:"Bricolage Grotesque",Georgia,serif;font-weight:700;font-size:1.5rem;
		color:var(--tinta);margin:0;letter-spacing:-.02em}
	.sub{font-size:15.5px;color:var(--tenue);margin:4px 0 0}
	.nuevo{margin-left:auto;background:var(--violeta);color:#fff;border:none;cursor:pointer;
		font-size:15px;font-weight:600;padding:11px 20px}
	.nuevo:hover{opacity:.87}
	main{max-width:1100px;margin:0 auto;padding:26px 30px 80px}
	section{margin-bottom:44px}
	h2{font-family:"Bricolage Grotesque",serif;font-weight:600;font-size:1.25rem;color:var(--tinta);
		margin:0 0 6px;letter-spacing:-.018em}
	.ayuda{font-size:15.5px;color:var(--tenue);margin:0 0 18px;max-width:74ch;line-height:1.55}
	.nada{font-size:15.5px;color:var(--pale);font-style:italic}

	.alta{border:1px solid var(--raya2);background:var(--hoja);padding:22px;margin-bottom:34px}
	.campos{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:14px}
	@media(max-width:860px){.campos{grid-template-columns:1fr}}
	label{display:block;font-family:"DM Mono",monospace;font-size:12px;letter-spacing:.12em;
		text-transform:uppercase;color:var(--tenue);margin-bottom:14px}
	input,select,textarea{width:100%;margin-top:6px;padding:9px 11px;border:1px solid var(--raya2);
		background:var(--papel);color:var(--tinta);font-family:Manrope,sans-serif;font-size:15px;
		text-transform:none;letter-spacing:0;line-height:1.45}
	textarea{resize:vertical}
	input:focus,select:focus,textarea:focus{outline:2px solid var(--violeta);outline-offset:-1px}
	.rot{font-family:"DM Mono",monospace;font-size:12px;letter-spacing:.12em;text-transform:uppercase;
		color:var(--tenue);margin:4px 0 10px}
	.pick{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:14px}
	.chk{display:inline-flex;align-items:center;gap:8px;margin:0;padding:7px 11px;cursor:pointer;
		border:1px solid var(--raya2);background:var(--papel);text-transform:none;letter-spacing:0;
		font-family:Manrope,sans-serif;font-size:14.5px;color:var(--texto)}
	.chk input{width:auto;margin:0}
	.chk b{font-family:"DM Mono",monospace;font-size:13px}
	.chk.m b{color:var(--mat)} .chk.i b{color:var(--inf)}
	.chk.on.m{background:var(--mat-w);border-color:var(--mat)}
	.chk.on.i{background:var(--inf-w);border-color:var(--inf)}
	.aviso{font-size:15.5px;padding:11px 15px;margin:0 0 16px;border-left:3px solid var(--raya2);
		background:var(--franja);color:var(--tenue)}
	.aviso.si{border-left-color:var(--epa);background:var(--epa-w);color:var(--tinta)}
	.add{background:var(--violeta);color:#fff;border:none;cursor:pointer;font-size:15px;
		font-weight:600;padding:11px 22px}

	.lista{display:flex;flex-direction:column;gap:14px}
	.epa{background:var(--hoja);border:1px solid var(--raya);border-left:3px solid var(--raya2);
		padding:16px 19px 17px;box-shadow:var(--sombra)}
	.epa.cruza{border-left-color:var(--epa)}
	.epa.curricular{border-left-color:var(--epa)}
	.e-h{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:7px}
	.e-h h3 a{color:inherit;text-decoration:none;text-underline-offset:3px}
	.e-h h3 a:hover{text-decoration:underline;text-decoration-color:var(--violeta)}
	.e-h h3{font-family:"Bricolage Grotesque",serif;font-weight:600;font-size:1.12rem;
		color:var(--tinta);margin:0;letter-spacing:-.015em}
	.sello{font-family:"DM Mono",monospace;font-size:11.5px;letter-spacing:.13em;text-transform:uppercase;
		background:var(--epa);color:#fff;padding:3px 8px;font-weight:500}
	.est{font-family:"DM Mono",monospace;font-size:12px;letter-spacing:.09em;text-transform:uppercase;
		color:var(--tenue);border:1px solid var(--raya2);padding:2px 7px}
	.est.en-curso{color:var(--violeta);border-color:var(--violeta)}
	.x{margin-left:auto;background:none;border:none;cursor:pointer;color:var(--pale);font-size:20px;line-height:1}
	.x:hover{color:var(--inf)}
	.meta{font-family:"DM Mono",monospace;font-size:13px;color:var(--tenue);margin:0 0 9px}
	.prob{font-size:15.5px;line-height:1.55;margin:0 0 11px;color:var(--texto)}
	.chips{display:flex;gap:6px;flex-wrap:wrap}
	.chip{font-family:"DM Mono",monospace;font-size:12.5px;font-weight:500;padding:3px 8px}
	.chip.m{background:var(--mat-w);color:var(--mat)}
	.chip.i{background:var(--inf-w);color:var(--inf)}
	.chip.e{background:var(--epa-w);color:var(--epa)}

	.cruces{border:1px solid var(--epa);background:var(--epa-w);padding:14px 18px}
	.cr{display:grid;grid-template-columns:auto auto 1fr auto;gap:14px;align-items:baseline;
		padding:8px 0;border-bottom:1px solid var(--raya)}
	.cr:last-child{border-bottom:none}
	.cr code{font-family:"DM Mono",monospace;font-size:13px;white-space:nowrap;color:var(--tinta)}
	.cm{color:var(--mat)} .ci{color:var(--inf)}
	.cq{font-family:"DM Mono",monospace;font-size:12px;color:var(--tenue);white-space:nowrap}
	.cr span{font-size:15.5px;line-height:1.4}
	.cr b{color:var(--tinta)}
	.cr em{font-family:"DM Mono",monospace;font-size:11.5px;letter-spacing:.1em;font-style:normal;
		text-transform:uppercase;color:var(--tenue);border:1px solid var(--raya2);padding:2px 6px;white-space:nowrap}
</style>
