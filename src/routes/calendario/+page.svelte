<script lang="ts">
	import { enhance } from '$app/forms';
	import { untrack } from 'svelte';
	import { TIPOS, rotulo, colorDe } from '$lib/cuatrimestres';
	let { data } = $props();

	const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
		'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
	const DIAS = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];

	let mes = $state(untrack(() => data.mes));
	let anio = $state(untrack(() => data.anio));
	let diaElegido = $state<string | null>(null);
	let verHorarios = $state(true);
	let quien = $state('todas');

	const grillaDe = (f: string) => {
		if (!verHorarios) return [];
		const d = new Date(f + 'T00:00:00').getDay();
		return data.grilla.filter((b) => b.dia === d && (quien === 'todas' || b.docente === quien));
	};

	const iso = (a: number, m: number, d: number) =>
		`${a}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

	const grilla = $derived.by(() => {
		const primero = new Date(anio, mes - 1, 1);
		const ultimo = new Date(anio, mes, 0).getDate();
		const offset = (primero.getDay() + 6) % 7; // lunes = 0
		const celdas: ({ d: number; iso: string } | null)[] = Array(offset).fill(null);
		for (let d = 1; d <= ultimo; d++) celdas.push({ d, iso: iso(anio, mes, d) });
		while (celdas.length % 7 !== 0) celdas.push(null);
		return celdas;
	});

	/** Un evento de varios días aparece en todas sus fechas. */
	const delDia = (f: string) =>
		data.eventos.filter((e) => f >= e.fecha && f <= (e.hasta ?? e.fecha));
	const clave = $derived(`${anio}-${String(mes).padStart(2, '0')}`);
	const enElMes = $derived(data.porMes[clave] ?? 0);
	const conEventos = $derived(
		Object.entries(data.porMes).sort(([a], [b]) => a.localeCompare(b))
	);
	const cortito = (f: string) =>
		new Date(f + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
	const hoyIso = new Date().toISOString().slice(0, 10);

	function mover(n: number) {
		let m = mes + n, a = anio;
		if (m > 12) { m = 1; a++; } if (m < 1) { m = 12; a--; }
		mes = m; anio = a; diaElegido = null;
	}
	const nombreCurso = (id: string | null) =>
		id ? (data.cursos.find((c) => c.id === id)?.etiqueta ?? '') : 'Toda la escuela';

	/* Quién está a una hora dada. La franja se elige tocando un renglón del
	   horario; el cruce sale de la misma grilla que pinta el calendario. */
	let franja = $state<{ desde: string; hasta: string } | null>(null);
	const mismaFranja = (a: { desde: string; hasta: string }, b: typeof a) =>
		a.desde === b.desde && a.hasta === b.hasta;

	/** Dos bloques se pisan si uno empieza antes de que el otro termine. */
	const seSolapa = (b: { desde: string; hasta: string }, f: { desde: string; hasta: string }) =>
		b.desde < f.hasta && b.hasta > f.desde;

	const enFranja = $derived.by(() => {
		if (!diaElegido || !franja) return [];
		const d = new Date(diaElegido + 'T00:00:00').getDay();
		return data.grilla.filter((b) => b.dia === d && seSolapa(b, franja!));
	});
	const ocupadas = $derived([...new Set(enFranja.map((b) => b.docente))].sort());
	const sinClase = $derived(data.docentes.filter((n) => !ocupadas.includes(n)));
</script>

<svelte:head><title>Areal · calendario</title></svelte:head>

<header>
	<h1>Calendario del área</h1>
	<label class="filtro">
		<input type="checkbox" bind:checked={verHorarios} /> Horarios
	</label>
	<select class="filtro-doc" bind:value={quien} aria-label="Filtrar por docente">
		<option value="todas">Todas</option>
		{#each data.docentes as d}<option value={d}>{d}</option>{/each}
	</select>
	<span class="ref">
		<i><span class="sw m"></span> Matemática</i><i><span class="sw i"></span> Informática</i>
	</span>
	<nav class="mover">
		<button type="button" onclick={() => mover(-1)} aria-label="Mes anterior">‹</button>
		<b>{MESES[mes - 1]} {anio}{#if enElMes}<i class="cn">{enElMes}</i>{/if}</b>
		<button type="button" onclick={() => mover(1)} aria-label="Mes siguiente">›</button>
	</nav>
</header>

<div class="tablero">
	<main>
		<div class="semana">{#each DIAS as d}<span>{d}</span>{/each}</div>
		{#if !enElMes}
			<div class="sinnada">
				<p><b>{MESES[mes - 1]} no tiene ningún evento cargado.</b></p>
				<p>Las fechas institucionales que están en Areal salen de la Circular técnica 02/2026,
					que sólo cubre el primer cuatrimestre. Las del segundo todavía no se publicaron.</p>
				<p class="saltar">Meses con eventos:
					{#each conEventos as [k, n]}
						<button type="button" onclick={() => { anio = +k.slice(0,4); mes = +k.slice(5); diaElegido = null; }}>
							{MESES[+k.slice(5) - 1].slice(0,3)} <i>{n}</i>
						</button>
					{/each}
				</p>
			</div>
		{/if}
		<div class="mes">
			{#each grilla as celda}
				{#if celda}
					{@const evs = delDia(celda.iso)}
					<button type="button" class="dia" class:hoy={celda.iso === hoyIso}
						class:sel={diaElegido === celda.iso} class:finde={new Date(celda.iso+'T00:00:00').getDay() % 6 === 0}
						onclick={() => (diaElegido = diaElegido === celda.iso ? null : celda.iso)}>
						<span class="dia-in">
						<span class="n">{celda.d}</span>
						{#each grillaDe(celda.iso) as b}
							<span class="clase {b.disciplina === 'matematica' ? 'm' : 'i'}"
								title="{b.curso} · {b.espacio} · {b.docente} · {b.desde}–{b.hasta}"
								>{b.curso.replace(' año','')} {b.desde} <i>{b.corto}</i></span>
						{/each}
						{#each evs.slice(0, 3) as e}
							<span class="ev {colorDe(e.tipo)}" class:pierde={e.afectaClases}>{e.titulo}</span>
						{/each}
						{#if evs.length > 3}<span class="mas">+{evs.length - 3}</span>{/if}
						</span>
					</button>
				{:else}<span class="dia vacio"></span>{/if}
			{/each}
		</div>

		{#if diaElegido}
			<section class="panel">
				<h2>{new Date(diaElegido + 'T00:00:00').toLocaleDateString('es-AR',
					{ weekday:'long', day:'numeric', month:'long' })}</h2>

				{#if grillaDe(diaElegido).length}
					<div class="horario">
						<h3>Clases del área ese día</h3>
						<p class="pista">Tocá un horario para ver quién está a esa hora.</p>
						{#each grillaDe(diaElegido) as b}
							<button type="button" class="hf"
								aria-pressed={franja !== null && mismaFranja(b, franja)}
								onclick={() => (franja = franja && mismaFranja(b, franja)
									? null : { desde: b.desde, hasta: b.hasta })}>
								<span class="hf-in">
									<code>{b.desde}–{b.hasta}</code>
									<b>{b.curso}</b>
									<span class="esp {b.disciplina === 'matematica' ? 'm' : 'i'}">{b.espacio}</span>
									<span>{b.docente}</span>
								</span>
							</button>
						{/each}

						{#if franja}
							<div class="cruce">
								<h4>De {franja.desde} a {franja.hasta}</h4>
								<p class="rot">En clase</p>
								<ul>
									{#each enFranja as b}
										<li><b>{b.docente}</b> <span>{b.curso} · {b.espacio}</span></li>
									{/each}
								</ul>
								{#if sinClase.length}
									<p class="rot">Sin clase del área a esa hora</p>
									<ul class="libres">
										{#each sinClase as n}<li><b>{n}</b></li>{/each}
									</ul>
								{/if}
								<p class="salvedad">
									Sale del horario del área que está cargado. Si alguna tiene clase de otra
									materia a esa hora, acá no figura.
								</p>
							</div>
						{/if}
					</div>
				{/if}

				{#each delDia(diaElegido) as e}
					<div class="fila">
						<span class="pill {colorDe(e.tipo)}">{rotulo(e.tipo)}</span>
						<div>
							<b>{e.titulo}</b>
							{#if e.nota}<span class="nota">{e.nota}</span>{/if}
							<span class="alcance">{nombreCurso(e.cursoId)}{e.afectaClases ? ' · sin clase' : ''}</span>
						</div>
						<form method="POST" action="?/borrar" use:enhance>
							<input type="hidden" name="id" value={e.id} />
							<button class="x" type="submit" aria-label="Borrar">×</button>
						</form>
					</div>
				{/each}

				<form class="alta" method="POST" action="?/agregar" use:enhance={() => async ({ update }) => { await update({ reset: true }); }}>
					<input type="hidden" name="fecha" value={diaElegido} />
					<div class="campos">
						<label>Qué pasa
							<input name="titulo" required placeholder="Paseo Don Jaime, entrega, jornada…" />
						</label>
						<label>Tipo
							<select name="tipo">
								{#each TIPOS as t}<option value={t.id}>{t.rot}</option>{/each}
							</select>
						</label>
						<label>Alcance
							<select name="cursoId">
								<option value="">Toda la escuela</option>
								{#each data.cursos as c}<option value={c.id}>{c.etiqueta}</option>{/each}
							</select>
						</label>
					</div>
					<label class="nota-l">Nota
						<input name="nota" placeholder="opcional" />
					</label>
					<label class="check">
						<input type="checkbox" name="afecta" /> Se pierde la clase de ese día
					</label>
					<button class="add" type="submit">Agregar</button>
				</form>
			</section>
		{/if}
	</main>

	<aside>
		<h2>Lo que viene</h2>
		{#if data.proximos.length}
			<div class="proximos">
				{#each data.proximos as e}
					<button type="button" class="px {colorDe(e.tipo)}"
						onclick={() => { anio = +e.fecha.slice(0,4); mes = +e.fecha.slice(5,7); diaElegido = e.fecha; }}>
						<span class="px-in">
							<span class="pf">{cortito(e.fecha)}{#if e.hasta && e.hasta !== e.fecha} – {cortito(e.hasta)}{/if}</span>
							<span class="pt">{e.titulo}</span>
							<span class="pd">{rotulo(e.tipo)}{#if e.curso} · {e.curso}{/if}{#if e.afectaClases} · sin clase{/if}</span>
						</span>
					</button>
				{/each}
			</div>
		{:else}
			<p class="ayuda">No quedan eventos por delante en lo que está cargado.</p>
		{/if}

		<h2 class="segunda">Clases efectivas</h2>
		<p class="ayuda">Días de la grilla menos lo que se pierde. Se calcula solo.</p>
		{#each data.cuenta as c}
			<div class="curso">
				<h3>{c.curso.etiqueta}</h3>
				{#each c.porDocente as pd}
					<div class="quien">
						<span class="nom">{pd.docente}</span>
						<span class="dias">{pd.dias.length === 1 ? '1 día' : pd.dias.length + ' días'}/sem</span>
					</div>
					{#each pd.filas as f}
						<div class="cuatri">
							<span class="q">{f.n}º cuatrimestre</span>
							<span class="num">{f.efectivas}</span>
							<span class="det">
								de {f.total}{#if f.perdidas} · −{f.perdidas} perdidas{/if}
								{#if f.restan > 0} · quedan <b>{f.restan}</b>{/if}
							</span>
						</div>
					{/each}
				{/each}
			</div>
		{/each}
	</aside>
</div>

<style>
	header{display:flex;align-items:center;gap:20px;flex-wrap:wrap;
		padding:20px 30px;border-bottom:1px solid var(--raya2)}
	h1{font-family:"Bricolage Grotesque",Georgia,serif;font-weight:700;font-size:1.5rem;
		color:var(--tinta);margin:0;letter-spacing:-.02em}
	.mover{margin-left:auto;display:flex;align-items:center;gap:14px}
	.mover b{font-family:"Bricolage Grotesque",serif;font-size:1.15rem;color:var(--tinta);
		min-width:12ch;text-align:center}
	.cn{font-family:"DM Mono",monospace;font-style:normal;font-size:12.5px;color:var(--hoja);
		background:var(--violeta);padding:2px 6px;margin-left:8px;vertical-align:3px}

	.sinnada{border:1px dashed var(--raya2);background:var(--franja);padding:20px 24px;margin-bottom:18px}
	.sinnada p{margin:0 0 9px;font-size:15.5px;line-height:1.55;color:var(--tenue);max-width:76ch}
	.sinnada b{color:var(--tinta)}
	.saltar{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin:14px 0 0!important}
	.saltar button{background:var(--hoja);border:1px solid var(--raya2);cursor:pointer;
		font-family:"DM Mono",monospace;font-size:13.5px;padding:5px 10px;color:var(--texto)}
	.saltar button:hover{border-color:var(--violeta);color:var(--violeta)}
	.saltar i{font-style:normal;color:var(--pale);font-size:12px}

	.proximos{display:flex;flex-direction:column;gap:6px;margin-bottom:30px}
	/* Los renglones van en un envoltorio propio: el contenido de un <button>
	   necesita una caja donde apilarse. */
	.px{background:var(--hoja);border:1px solid var(--raya);border-left:3px solid;cursor:pointer;
		padding:9px 11px;text-align:left;display:block;font:inherit;width:100%}
	.px-in{display:flex;flex-direction:column;gap:2px}
	.px:hover{border-color:var(--violeta)}
	.px.violeta{border-left-color:var(--violeta)} .px.mat{border-left-color:var(--mat)}
	.px.inf{border-left-color:var(--inf)} .px.epa{border-left-color:var(--epa)}
	.px.tenue{border-left-color:var(--raya2)}
	.pf{font-family:"DM Mono",monospace;font-size:12px;color:var(--violeta);letter-spacing:.04em}
	.pt{font-size:15px;color:var(--tinta);font-weight:600;line-height:1.3}
	.pd{font-family:"DM Mono",monospace;font-size:11.5px;color:var(--tenue)}
	.segunda{margin-top:4px}
	.mover button{background:var(--hoja);border:1px solid var(--raya2);cursor:pointer;
		font-size:20px;line-height:1;padding:4px 13px;color:var(--tenue)}
	.mover button:hover{color:var(--violeta);border-color:var(--violeta)}

	.tablero{display:grid;grid-template-columns:1fr 300px;gap:0;align-items:start}
	@media(max-width:1000px){.tablero{grid-template-columns:1fr}}
	main{padding:22px 30px 60px;min-width:0}

	.semana{display:grid;grid-template-columns:repeat(7,1fr);gap:1px;margin-bottom:1px}
	.semana span{font-family:"DM Mono",monospace;font-size:12px;letter-spacing:.13em;
		text-transform:uppercase;color:var(--tenue);padding:0 0 8px 4px}
	.mes{display:grid;grid-template-columns:repeat(7,1fr);gap:1px;background:var(--raya)}
	/* En el teléfono cada día mide unos 40px: los chips se veían como rayitas.
	   Queda el número, y el detalle del día sale en el panel de abajo al tocarlo. */
	@media (max-width: 700px) {
		main{padding:16px 12px 40px}
		.dia{min-height:56px;padding:5px}
		.clase,.ev,.mas{display:none}
		.semana span{font-size:10px;letter-spacing:.06em;padding-left:2px}
	}
	.dia{background:var(--hoja);border:none;min-height:96px;padding:7px 8px;text-align:left;
		display:block;cursor:pointer;font:inherit;transition:background .12s}
	.dia-in{display:flex;flex-direction:column;gap:3px}
	.dia:hover{background:var(--violeta-w)}
	.dia.vacio{background:var(--papel);cursor:default}
	.dia.finde{background:var(--franja)}
	.dia.hoy{box-shadow:inset 0 0 0 2px var(--violeta)}
	.dia.sel{background:var(--violeta-w);box-shadow:inset 0 0 0 2px var(--violeta)}
	.dia .n{font-family:"DM Mono",monospace;font-size:14px;color:var(--tenue);font-weight:500}
	.clase{font-family:"DM Mono",monospace;font-size:11.5px;line-height:1.3;
		padding:1px 4px;border-left:2px solid;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
	.clase.m{background:var(--mat-w);border-color:var(--mat);color:var(--mat)}
	.clase.i{background:var(--inf-w);border-color:var(--inf);color:var(--inf)}
	.clase i{font-style:normal;opacity:.72}
	.filtro{display:flex;align-items:center;gap:7px;margin:0;font-family:Manrope,sans-serif;
		font-size:15px;text-transform:none;letter-spacing:0;color:var(--texto)}
	.filtro input{width:auto;margin:0}
	.filtro-doc{width:auto;margin:0;padding:7px 10px;font-size:15px}
	.ref{display:flex;gap:14px;font-family:"DM Mono",monospace;font-size:12px;color:var(--tenue)}
	.ref i{font-style:normal;display:inline-flex;align-items:center;gap:6px}
	.sw{width:10px;height:10px;display:block}
	.sw.m{background:var(--mat)} .sw.i{background:var(--inf)}
	.horario{border:1px solid var(--raya);background:var(--papel);padding:12px 15px;margin-bottom:18px}
	.horario h3{font-family:"DM Mono",monospace;font-size:11.5px;letter-spacing:.13em;
		text-transform:uppercase;color:var(--tenue);margin:0 0 9px;font-weight:500}
	.esp{font-family:"DM Mono",monospace;font-size:12.5px;padding:2px 6px}
	.esp.m{background:var(--mat-w);color:var(--mat)}
	.esp.i{background:var(--inf-w);color:var(--inf)}
	.pista{font-size:13px;color:var(--pale);margin:0 0 7px}
	.hf{display:block;width:100%;text-align:left;background:none;border:none;font:inherit;
		padding:3px 0;cursor:pointer}
	.hf-in{display:grid;grid-template-columns:auto auto auto 1fr;gap:12px;align-items:baseline}
	.hf:hover code{color:var(--tinta)}
	.hf[aria-pressed="true"]{background:var(--violeta-w);box-shadow:0 0 0 4px var(--violeta-w)}
	.cruce{margin-top:11px;border-top:1px solid var(--raya);padding-top:11px}
	.cruce h4{font-family:"DM Mono",monospace;font-size:13px;letter-spacing:.08em;
		color:var(--violeta);margin:0 0 9px;font-weight:500}
	.cruce .rot{font-family:"DM Mono",monospace;font-size:11px;letter-spacing:.13em;
		text-transform:uppercase;color:var(--pale);margin:0 0 5px}
	.cruce ul{list-style:none;margin:0 0 12px;padding:0;display:flex;flex-direction:column;gap:3px}
	.cruce li{display:flex;gap:10px;align-items:baseline;flex-wrap:wrap;font-size:14.5px}
	.cruce li b{color:var(--tinta)}
	.cruce li span{color:var(--tenue);font-size:13.5px}
	.cruce .libres li b{color:var(--tenue);font-weight:500}
	.salvedad{font-size:12.5px;color:var(--pale);line-height:1.5;margin:0;max-width:58ch}
	.hf code{font-family:"DM Mono",monospace;font-size:13.5px;color:var(--violeta)}
	.hf b{color:var(--tinta);font-size:15.5px}
	.hf span{font-size:14.5px;color:var(--tenue)}
	.dia.hoy .n{color:var(--violeta);font-weight:700}
	.ev{font-size:13px;line-height:1.28;padding:2px 5px;overflow:hidden;
		text-overflow:ellipsis;white-space:nowrap;border-left:2px solid}
	.ev.violeta{background:var(--violeta-w);border-color:var(--violeta);color:var(--tinta)}
	.ev.mat{background:var(--mat-w);border-color:var(--mat);color:var(--tinta)}
	.ev.inf{background:var(--inf-w);border-color:var(--inf);color:var(--tinta)}
	.ev.epa{background:var(--epa-w);border-color:var(--epa);color:var(--tinta)}
	.ev.tenue{background:var(--franja);border-color:var(--raya2);color:var(--texto)}
	.ev.pierde{text-decoration:line-through;text-decoration-thickness:1px;opacity:.85}
	.mas{font-family:"DM Mono",monospace;font-size:11.5px;color:var(--tenue)}

	.panel{margin-top:22px;border:1px solid var(--raya2);background:var(--hoja);padding:20px 22px}
	.panel h2{font-family:"Bricolage Grotesque",serif;font-size:1.15rem;color:var(--tinta);
		margin:0 0 16px;letter-spacing:-.015em;text-transform:capitalize}
	.fila{display:grid;grid-template-columns:auto 1fr auto;gap:14px;align-items:start;
		padding:11px 0;border-bottom:1px solid var(--raya)}
	.pill{font-family:"DM Mono",monospace;font-size:11.5px;letter-spacing:.1em;
		text-transform:uppercase;padding:3px 7px;white-space:nowrap}
	.pill.violeta{background:var(--violeta-w);color:var(--violeta)}
	.pill.mat{background:var(--mat-w);color:var(--mat)}
	.pill.inf{background:var(--inf-w);color:var(--inf)}
	.pill.epa{background:var(--epa-w);color:var(--epa)}
	.pill.tenue{background:var(--franja);color:var(--tenue)}
	.fila b{color:var(--tinta);font-size:15.5px}
	.nota,.alcance{display:block;font-size:14px;color:var(--tenue)}
	.alcance{font-family:"DM Mono",monospace;font-size:12.5px;margin-top:2px}
	.x{background:none;border:none;cursor:pointer;color:var(--pale);font-size:20px;line-height:1}
	.x:hover{color:var(--inf)}

	.alta{margin-top:18px;padding-top:18px;border-top:1px solid var(--raya2)}
	.campos{display:grid;grid-template-columns:2fr 1fr 1fr;gap:12px}
	@media(max-width:720px){.campos{grid-template-columns:1fr}}
	label{display:block;font-family:"DM Mono",monospace;font-size:12px;letter-spacing:.11em;
		text-transform:uppercase;color:var(--tenue);margin-bottom:12px}
	input:not([type]),select{width:100%;margin-top:6px;padding:9px 11px;
		border:1px solid var(--raya2);background:var(--papel);color:var(--tinta);
		font-family:Manrope,sans-serif;font-size:15px;text-transform:none;letter-spacing:0}
	input:focus,select:focus{outline:2px solid var(--violeta);outline-offset:-1px}
	.check{display:flex;align-items:center;gap:9px;text-transform:none;letter-spacing:0;
		font-family:Manrope,sans-serif;font-size:15px;color:var(--texto)}
	.check input{width:auto;margin:0}
	.add{background:var(--violeta);color:#fff;border:none;cursor:pointer;
		font-size:15px;font-weight:600;padding:11px 22px}
	.add:hover{opacity:.87}

	aside{background:var(--franja);border-left:1px solid var(--raya2);padding:22px 22px 60px;
		min-height:calc(100vh - 66px)}
	@media(max-width:1000px){aside{border-left:none;border-top:1px solid var(--raya2);min-height:0}}
	aside h2{font-family:"DM Mono",monospace;font-size:12.5px;letter-spacing:.14em;
		text-transform:uppercase;color:var(--tenue);margin:0 0 6px;font-weight:500}
	.ayuda{font-size:14.5px;color:var(--tenue);margin:0 0 20px;line-height:1.45}
	.curso{margin-bottom:20px;background:var(--hoja);border:1px solid var(--raya);padding:13px 15px}
	.curso h3{font-family:"Bricolage Grotesque",serif;font-size:1.05rem;color:var(--tinta);
		margin:0 0 9px;letter-spacing:-.015em}
	.quien{display:flex;justify-content:space-between;align-items:baseline;gap:8px;
		margin:11px 0 2px;padding-top:9px;border-top:1px solid var(--raya)}
	.curso .quien:first-of-type{border-top:none;padding-top:0;margin-top:0}
	.nom{font-size:15px;color:var(--tinta);font-weight:600}
	.dias{font-family:"DM Mono",monospace;font-size:12px;color:var(--pale)}
	.cuatri{display:grid;grid-template-columns:1fr auto;gap:2px 12px;align-items:baseline;padding:3px 0}
	.q{font-family:"DM Mono",monospace;font-size:12.5px;color:var(--tenue)}
	.num{font-family:"Bricolage Grotesque",serif;font-size:1.3rem;font-weight:700;
		color:var(--violeta);line-height:1}
	.det{grid-column:1/-1;font-family:"DM Mono",monospace;font-size:12px;color:var(--pale)}
	.det b{color:var(--tinta)}
</style>
