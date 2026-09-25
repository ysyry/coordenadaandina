<script lang="ts">
	import { enhance } from '$app/forms';
	let { data } = $props();

	const NOMBRE: Record<number, string> = { 1:'Primer',2:'Segundo',3:'Tercer',4:'Cuarto',5:'Quinto',
		6:'Sexto',7:'Séptimo',8:'Octavo',9:'Noveno',10:'Décimo' };
	const disc = (d: string) => (d === 'matematica' ? 'm' : d === 'informatica' ? 'i' : 'e');
	let editarNudos = $state(false);
	let elegidos = $state(data.nudos.map((n) => n.id));

	const llenos = $derived(data.campos.filter((c) => (data.epa as any)[c.k]?.trim()).length);
	const objsLlenos = $derived(data.objetivos.filter((o) => o.como.trim()).length);
	const ejesLlenos = $derived(data.ejes.filter((o) => o.como.trim()).length);
</script>

<svelte:head><title>Areal · {data.epa.nombre}</title></svelte:head>

<div class="encabezado">
	<div>
		<a class="atras" href="/epa">← Todos los EPA</a>
		<h1>{data.epa.nombre}</h1>
		<p class="meta">
			{data.curso}{#if data.epa.cuatrimestre} · {NOMBRE[data.epa.cuatrimestre]} cuatrimestre{/if}
			· {data.epa.anioCalendario}
			{#if data.cruza}<span class="sello">EPA</span>{/if}
			<span class="est">{data.epa.estado}</span>
		</p>
		{#if data.epa.docentes}<p class="docs">{data.epa.docentes}</p>{/if}
	</div>
	<div class="progreso">
		<span class="pn">{llenos}/{data.campos.length}</span>
		<span class="pl">campos del mapa</span>
	</div>
</div>

<main>
	<section class="bloque">
		<div class="b-h">
			<h2>Nudos que pone en juego</h2>
			<button class="chico fantasma" type="button" onclick={() => (editarNudos = !editarNudos)}>
				{editarNudos ? 'Cancelar' : 'Cambiar'}
			</button>
		</div>

		{#if editarNudos}
			<form method="POST" action="?/nudos" use:enhance={() => async ({ update }) => {
				editarNudos = false; await update(); }}>
				<div class="pick">
					{#each data.todos as n}
						<label class="chk {disc(n.disciplina)}" class:on={elegidos.includes(n.id)}>
							<input type="checkbox" name="nudos" value={n.id} bind:group={elegidos} />
							<b>{n.codigo}</b> {n.nombre}
						</label>
					{/each}
				</div>
				<button class="chico" type="submit">Guardar</button>
			</form>
		{:else}
			<div class="chips">
				{#each data.nudos as n}<span class="chip {disc(n.disciplina)}">{n.codigo} · {n.nombre}</span>{/each}
				{#if !data.nudos.length}<span class="vacio">Sin nudos elegidos.</span>{/if}
			</div>

			{#if data.saberes.length}
				<p class="ayuda">Lo que prescribe la resolución para esos nudos en este cuatrimestre.
					Sale del catálogo: no hay que escribirlo.</p>
				<div class="saberes">
					{#each data.saberes as sb}
						<div class="sb {disc(sb.disciplina)}">
							<b>{sb.codigo} — {sb.titulo ?? sb.nombre}</b>
							<p>{sb.texto}</p>
						</div>
					{/each}
				</div>
			{/if}
		{/if}
	</section>

	{#each data.campos as c}
		<section class="bloque">
			<h2>{c.rot}</h2>
			{#if c.ayuda}<p class="ayuda">{c.ayuda}</p>{/if}
			<form method="POST" action="?/campo" use:enhance>
				<input type="hidden" name="k" value={c.k} />
				<textarea name="v" rows={(data.epa as any)[c.k] ? 6 : 3}
					placeholder="Todavía sin escribir">{(data.epa as any)[c.k]}</textarea>
				<button class="chico" type="submit">Guardar</button>
			</form>
		</section>
	{/each}

	<section class="bloque objetivos">
		<div class="b-h">
			<h2>Ejes de trabajo 2026</h2>
			<span class="cuenta">{ejesLlenos} de {data.ejes.length}</span>
		</div>
		<p class="ayuda">Circular técnica 01/2026. Son los que cita el checklist institucional
			cuando pregunta si los objetivos están incorporados a la planificación areal.</p>
		{#each data.ejes as o}
			<form class="obj" class:hecho={o.como.trim()} method="POST" action="?/objetivo" use:enhance>
				<input type="hidden" name="clave" value={o.clave} />
				<p class="o-rot">{o.rot}</p>
				<textarea name="como" rows="2" placeholder="¿Cómo aparece en este EPA?">{o.como}</textarea>
				<button class="chico" type="submit">Guardar</button>
			</form>
		{/each}
	</section>

	<section class="bloque objetivos">
		<div class="b-h">
			<h2>Desafíos institucionales 2026</h2>
			<span class="cuenta">{objsLlenos} de {data.objetivos.length}</span>
		</div>
		<div class="ojo">
			<b>Hay dos listas.</b> El Mapa de Área llama “objetivos institucionales 2026” a estos
			cuatro; la Circular 01/2026 llama “ejes de trabajo” a los otros cuatro, que son distintos.
			Conviene preguntar en la próxima reunión cuál de las dos rige, o si son las dos.
		</div>
		{#each data.objetivos as o}
			<form class="obj" class:hecho={o.como.trim()} method="POST" action="?/objetivo" use:enhance>
				<input type="hidden" name="clave" value={o.clave} />
				<p class="o-rot">{o.rot}</p>
				<textarea name="como" rows="2" placeholder="¿Cómo aparece en este EPA?">{o.como}</textarea>
				<button class="chico" type="submit">Guardar</button>
			</form>
		{/each}
	</section>
</main>

<style>
	.encabezado{display:flex;align-items:flex-start;gap:24px;flex-wrap:wrap;
		padding:24px 30px 20px;border-bottom:1px solid var(--raya2)}
	.atras{font-family:"DM Mono",monospace;font-size:13px;color:var(--tenue);
		text-decoration:none;letter-spacing:.06em}
	.atras:hover{color:var(--violeta)}
	h1{font-family:"Bricolage Grotesque",Georgia,serif;font-weight:700;font-size:1.6rem;
		color:var(--tinta);margin:7px 0 6px;letter-spacing:-.022em}
	.meta{font-family:"DM Mono",monospace;font-size:13px;color:var(--tenue);margin:0;
		display:flex;align-items:center;gap:10px;flex-wrap:wrap}
	.sello{background:var(--epa);color:#fff;padding:3px 8px;letter-spacing:.13em;
		text-transform:uppercase;font-size:11.5px;font-weight:500}
	.est{border:1px solid var(--violeta);color:var(--violeta);padding:2px 7px;
		letter-spacing:.09em;text-transform:uppercase;font-size:12px}
	.docs{font-size:15px;color:var(--texto);margin:9px 0 0;max-width:70ch}
	.progreso{margin-left:auto;text-align:right}
	.pn{font-family:"Bricolage Grotesque",serif;font-size:1.7rem;font-weight:700;
		color:var(--violeta);display:block;line-height:1}
	.pl{font-family:"DM Mono",monospace;font-size:11.5px;letter-spacing:.11em;
		text-transform:uppercase;color:var(--tenue)}

	main{max-width:900px;margin:0 auto;padding:26px 30px 90px}
	.bloque{border:1px solid var(--raya);background:var(--hoja);padding:20px 22px;margin-bottom:16px}
	.b-h{display:flex;align-items:center;gap:14px;margin-bottom:6px}
	h2{font-family:"Bricolage Grotesque",serif;font-weight:600;font-size:1.15rem;color:var(--tinta);
		margin:0 0 6px;letter-spacing:-.015em}
	.b-h h2{margin:0}
	.cuenta{margin-left:auto;font-family:"DM Mono",monospace;font-size:12.5px;color:var(--tenue)}
	.ayuda{font-size:14.5px;color:var(--tenue);margin:0 0 14px;line-height:1.5;max-width:74ch}
	textarea{width:100%;padding:11px 13px;border:1px solid var(--raya2);background:var(--papel);
		color:var(--tinta);font-family:Manrope,sans-serif;font-size:15px;line-height:1.55;resize:vertical}
	textarea:focus{outline:2px solid var(--violeta);outline-offset:-1px}
	textarea::placeholder{color:var(--pale);font-style:italic}
	.chico{margin-top:9px;background:var(--violeta);color:#fff;border:none;cursor:pointer;
		font-size:14.5px;font-weight:600;padding:7px 15px}
	.chico:hover{opacity:.87}
	.chico.fantasma{margin:0 0 0 auto;background:none;color:var(--tenue);border:1px solid var(--raya2);
		font-weight:500}
	.chico.fantasma:hover{color:var(--violeta);border-color:var(--violeta);opacity:1}

	.chips{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:16px}
	.chip{font-family:"DM Mono",monospace;font-size:13px;font-weight:500;padding:5px 10px}
	.chip.m{background:var(--mat-w);color:var(--mat)}
	.chip.i{background:var(--inf-w);color:var(--inf)}
	.chip.e{background:var(--epa-w);color:var(--epa)}
	.vacio{font-size:15px;color:var(--pale);font-style:italic}
	.pick{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:12px}
	.chk{display:inline-flex;align-items:center;gap:8px;padding:7px 11px;cursor:pointer;
		border:1px solid var(--raya2);background:var(--papel);font-size:14.5px;color:var(--texto)}
	.chk input{width:auto;margin:0}
	.chk b{font-family:"DM Mono",monospace;font-size:12.5px}
	.chk.m b{color:var(--mat)} .chk.i b{color:var(--inf)} .chk.e b{color:var(--epa)}
	.chk.on.m{background:var(--mat-w);border-color:var(--mat)}
	.chk.on.i{background:var(--inf-w);border-color:var(--inf)}
	.chk.on.e{background:var(--epa-w);border-color:var(--epa)}

	.saberes{display:flex;flex-direction:column;gap:11px}
	.sb{border-left:3px solid;padding:3px 0 3px 14px}
	.sb.m{border-color:var(--mat)} .sb.i{border-color:var(--inf)} .sb.e{border-color:var(--epa)}
	.sb b{font-family:"DM Mono",monospace;font-size:13px;display:block;margin-bottom:4px}
	.sb.m b{color:var(--mat)} .sb.i b{color:var(--inf)} .sb.e b{color:var(--epa)}
	.sb p{margin:0;font-size:15px;line-height:1.5;color:var(--texto)}

	.objetivos{border-color:var(--epa)}
	.obj{padding:13px 0;border-top:1px solid var(--raya)}
	.obj:first-of-type{border-top:none}
	.o-rot{font-size:15px;color:var(--tinta);font-weight:600;margin:0 0 8px;line-height:1.4}
	.obj.hecho .o-rot::before{content:"✓ ";color:var(--epa);font-weight:700}
	.ojo{background:var(--epa-w);border-left:3px solid var(--epa);padding:12px 15px;
		margin:0 0 14px;font-size:15px;line-height:1.55;color:var(--texto)}
	.ojo b{color:var(--tinta)}
</style>
