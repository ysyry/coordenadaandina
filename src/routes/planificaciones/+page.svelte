<script lang="ts">
	import { mitadDe } from '$lib/clases';
	let { data } = $props();

	const cls = (d: string) => (d === 'matematica' ? 'm' : d === 'informatica' ? 'i' : 'e');
	const hs = (min: number) => {
		const h = Math.floor(min / 60), m = min % 60;
		return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
	};

	const todas = $derived(data.filas.flatMap((f) => f.materias));
	const tramos = $derived(todas.flatMap((m) => m.tramos));
	const e = $derived(data.entrega);

	/* La entrega, calculada. Ningún ítem se tilda a mano: cada uno mira
	   lo que hay cargado y dice dónde se arregla. */
	const entrega = $derived([
		{
			bloque: 'Del área · colectivo',
			items: [
				{ rot: 'Planificación Curricular de Área · Ciclo Básico e Interciclo',
				  pie: 'Res. 1381/22 y Res. 1278/24 · se ajusta año a año, no se reescribe · documento público',
				  hecho: e.basico.escritos >= 7, parcial: e.basico.escritos > 0,
				  dato: `${e.basico.escritos} de 7 componentes`, href: '/planificaciones/area' },
				{ rot: 'Planificación Curricular de Área · Ciclo Orientado',
				  pie: '4.º y 5.º',
				  hecho: e.orientado.escritos >= 7, parcial: e.orientado.escritos > 0,
				  dato: `${e.orientado.escritos} de 7 componentes`, href: '/planificaciones/area?ciclo=orientado' },
				{ rot: 'Situación Inicial Grupal',
				  pie: 'Reemplaza al diagnóstico áulico · la escribe el conjunto de docentes',
				  hecho: e.basico.situacion, parcial: false,
				  dato: e.basico.situacion ? 'escrita' : 'sin escribir', href: '/planificaciones/area' },
				{ rot: 'Núcleos problemáticos del área',
				  pie: 'Componente 2 · condiciona todo lo demás',
				  hecho: e.basico.nucleos, parcial: false,
				  dato: e.basico.nucleos ? 'acordados' : 'sin acordar', href: '/planificaciones/area' },
				{ rot: 'Acuerdo de reunión del área',
				  pie: 'Día, frecuencia, horario y duración · se mantiene todo el tramo',
				  hecho: e.reunion, parcial: false,
				  dato: e.reunion ? 'definido' : 'sin definir', href: '/reuniones' }
			]
		},
		{
			bloque: 'De cada docente',
			items: [
				{ rot: 'Planificación de cada materia',
				  pie: 'Una por materia y por cuatrimestre',
				  hecho: e.materias.abiertas >= e.materias.posibles, parcial: e.materias.abiertas > 0,
				  dato: `${e.materias.abiertas} de ${e.materias.posibles} abiertas`, href: '#materias' },
				{ rot: 'Criterios de evaluación',
				  pie: 'Definidos y se mantienen iguales todo el tramo',
				  hecho: e.materias.abiertas > 0 && e.materias.conCriterios >= e.materias.abiertas,
				  parcial: e.materias.conCriterios > 0,
				  dato: `${e.materias.conCriterios} de ${e.materias.abiertas} planificaciones`, href: '#materias' },
				{ rot: 'Las cuatro propuestas articuladas',
				  pie: 'Una por cuatrimestre en 1.º y en 2.º, con corte evaluativo · Res. 1381/22',
				  hecho: e.articuladas.hechas >= 4, parcial: e.articuladas.hechas > 0,
				  dato: `${e.articuladas.hechas} de 4`, href: '#materias' },
				...e.epas.map((x) => ({
					rot: `Mapa de Área · ${x.nombre}`,
					pie: 'Los diez campos que pide la escuela para el EPA',
					hecho: x.llenos >= x.total, parcial: x.llenos > 0,
					dato: `${x.llenos} de ${x.total} campos`, href: `/epa/${x.id}`
				})),
				{ rot: 'Informes de proceso',
				  pie: 'Insumo para acreditar y promover · viven en el Drive de la escuela, no acá',
				  hecho: false, parcial: false, dato: 'fuera de Areal', href: '' }
			]
		},
		{
			bloque: 'Lo que pide la escuela',
			items: [
				{ rot: 'Checklist institucional',
				  pie: 'Los siete ítems del tramo',
				  hecho: e.escuela.total > 0 && e.escuela.marcados >= e.escuela.total,
				  parcial: e.escuela.marcados > 0,
				  dato: `${e.escuela.marcados} de ${e.escuela.total || 7}`, href: '/checklist' }
			]
		}
	]);

	const listos = $derived(entrega.flatMap((b) => b.items).filter((i) => i.hecho).length);
	const totalItems = $derived(entrega.flatMap((b) => b.items).length);

	const cifras = $derived([
		{ n: listos, rot: `de ${totalItems} entregables listos` },
		{ n: tramos.filter((t) => t.planId).length, rot: 'planificaciones abiertas' },
		{ n: tramos.reduce((a, t) => a + t.unidades, 0), rot: 'unidades escritas' },
		{ n: tramos.filter((t) => t.planId && t.conCriterios).length, rot: 'con criterios' }
	]);
</script>

<svelte:head><title>Areal · planificaciones</title></svelte:head>

<div class="encabezado">
	<div>
		<h1>Planificaciones</h1>
		<p class="sede">Lo que cada materia va a hacer, contra las clases que realmente tiene</p>
	</div>
	<div class="cifras">
		{#each cifras as c}<div><b>{c.n}</b><span>{c.rot}</span></div>{/each}
	</div>
</div>

<main>
	<!-- ── 1 · lo que hace el área, que manda sobre todo lo demás ── -->
	<section class="area">
		<h2>Del área</h2>
		<p class="lead">
			La planificación por año se desprende de los acuerdos del área, no al revés.
			Primero los núcleos problemáticos, después la Situación Inicial Grupal y los
			propósitos, y recién ahí la programación de cada materia.
		</p>
		<div class="pcas">
			{#each [{ c: 'basico', rot: 'Ciclo Básico e Interciclo', pie: '1.º a 3.º', d: e.basico, href: '/planificaciones/area' }, { c: 'orientado', rot: 'Ciclo Orientado', pie: '4.º y 5.º', d: e.orientado, href: '/planificaciones/area?ciclo=orientado' }] as p}
				<a class="pca" href={p.href}>
					<span class="cu">{p.rot}<i>{p.pie}</i></span>
					<div class="celdas">
						{#each [1, 2, 3, 4, 5, 6, 7, 8] as k}
							<span class="cel" class:lleno={k <= p.d.escritos && k !== 6} class:fuera={k === 6}>{k}</span>
						{/each}
					</div>
					<span class="num"><b>{p.d.escritos}</b> de 7 componentes escritos</span>
					<span class="meta">
						{p.d.situacion ? 'Situación Inicial escrita' : 'sin Situación Inicial Grupal'}
						· {p.d.nucleos ? 'núcleos acordados' : 'núcleos sin acordar'}
					</span>
				</a>
			{/each}
		</div>
	</section>

	<!-- ── 2 · qué hay que entregar y en qué estado está ── -->
	<section class="entrega">
		<h2>Qué hay que tener y entregar</h2>
		<p class="lead">
			Nada de esto se tilda a mano: cada línea mira lo que hay cargado. Tocá la que
			esté en falta y te lleva a donde se arregla.
		</p>
		{#each entrega as b}
			<h3>{b.bloque}</h3>
			<div class="lista">
				{#each b.items as it}
					<svelte:element this={it.href ? 'a' : 'div'} href={it.href || undefined}
						class="it" class:ok={it.hecho} class:medio={!it.hecho && it.parcial}>
						<span class="marca">{it.hecho ? '✓' : it.parcial ? '◐' : '○'}</span>
						<div><b>{it.rot}</b><span class="pie">{it.pie}</span></div>
						<span class="dato">{it.dato}</span>
					</svelte:element>
				{/each}
			</div>
		{/each}
	</section>

	<!-- ── 3 · la parte de cada docente ── -->
	<h2 class="titMaterias" id="materias">De cada docente</h2>
	{#each data.filas as curso}
		<section class="curso">
			<header>
				<h2>{curso.etiqueta}</h2>
				{#each curso.epas as e}
					<a class="epa" href="/epa/{e.id}">EPA · C{e.c} · {e.nombre}</a>
				{/each}
			</header>

			<div class="materias">
				{#each curso.materias as m}
					<article class="materia {cls(m.disciplina)}">
						<div class="quien">
							<h3>{m.espacio}</h3>
							<p class="profes">{m.docentes.join(' · ') || 'sin docente en el horario'}</p>
							<p class="carga">
								{m.encuentros} {m.encuentros === 1 ? 'encuentro' : 'encuentros'} por semana · {hs(m.minutos)}
							</p>
						</div>

						<div class="tramos">
							{#each m.tramos as t}
								{@const excede = t.planificadas > t.hay}
								{@const usado = t.hay ? Math.min(100, (t.planificadas / t.hay) * 100) : 0}
								{#if t.planId}
									<a class="tramo" class:excede href="/planificaciones/{t.planId}">
										<span class="cu">C{t.c}<i>{mitadDe(t.c) === 1 ? 'primer' : 'segundo'} cuatrimestre</i></span>
										<div class="barra"><span style="width:{usado}%"></span></div>
										<span class="num">
											<b>{t.planificadas}</b> de {t.hay} clases
											{#if excede}<em>te pasás por {t.planificadas - t.hay}</em>{/if}
										</span>
										<span class="meta">
											{t.unidades} {t.unidades === 1 ? 'unidad' : 'unidades'}
											{#if !t.conCriterios} · <em class="falta">sin criterios</em>{/if}
										</span>
									</a>
								{:else}
									<form class="tramo vacio" method="POST" action="?/abrir">
										<input type="hidden" name="cursoId" value={curso.id} />
										<input type="hidden" name="espacio" value={m.espacio} />
										<input type="hidden" name="disciplina" value={m.disciplina} />
										<input type="hidden" name="cuatrimestre" value={t.c} />
										<span class="cu">C{t.c}<i>{mitadDe(t.c) === 1 ? 'primer' : 'segundo'} cuatrimestre</i></span>
										<span class="disp">{t.hay} clases disponibles{#if t.perdidas}{' · '}{t.perdidas} caen en feriado o jornada{/if}</span>
										<button type="submit">Armar</button>
									</form>
								{/if}
							{/each}
						</div>
					</article>
				{/each}
			</div>
		</section>
	{/each}

	<p class="pie">
		Las clases disponibles salen del horario cruzado con el calendario institucional:
		se cuenta cada vez que la materia cae en el cuatrimestre y se descuentan feriados,
		jornadas, actos y suspensiones. Ciclo lectivo {data.anio}.
	</p>
</main>

<style>
	.encabezado{display:flex;align-items:center;gap:24px;flex-wrap:wrap;
		padding:26px 30px 20px;border-bottom:1px solid var(--raya2)}
	.encabezado h1{font-family:"Bricolage Grotesque",Georgia,serif;font-weight:700;font-size:1.6rem;
		color:var(--tinta);margin:0;letter-spacing:-.02em;font-variation-settings:"wdth" 88}
	.sede{font-size:15.5px;color:var(--tenue);margin:4px 0 0}
	.cifras{display:flex;gap:28px;margin-left:auto;flex-wrap:wrap}
	.cifras div{display:flex;flex-direction:column;line-height:1.05}
	.cifras b{font-family:"Bricolage Grotesque",Georgia,serif;font-size:1.9rem;font-weight:700;
		color:var(--violeta);letter-spacing:-.03em}
	.cifras span{font-family:"DM Mono",monospace;font-size:11.5px;letter-spacing:.09em;
		text-transform:uppercase;color:var(--tenue);margin-top:4px}

	main{padding:26px 30px 40px;max-width:1400px;margin:0 auto}

	section.area,section.entrega{margin-bottom:34px}
	main h2{font-family:"Bricolage Grotesque",Georgia,serif;font-weight:700;font-size:1.35rem;
		color:var(--tinta);margin:0 0 6px;letter-spacing:-.02em}
	.titMaterias{margin-top:34px;padding-top:20px;border-top:2px solid var(--raya2)}
	.lead{font-size:15px;color:var(--tenue);margin:0 0 16px;max-width:76ch}

	.pcas{display:grid;grid-template-columns:1fr 1fr;gap:14px}
	@media(max-width:820px){.pcas{grid-template-columns:1fr}}
	.pca{display:flex;flex-direction:column;gap:9px;text-decoration:none;background:var(--hoja);
		border:1px solid var(--raya);border-left:3px solid var(--violeta);padding:16px 18px;
		box-shadow:var(--sombra)}
	.pca:hover{border-left-width:6px;padding-left:15px}
	.pca .cu{display:flex;align-items:baseline;gap:9px;font-family:"Bricolage Grotesque",Georgia,serif;
		font-size:1.1rem;font-weight:600;color:var(--tinta);letter-spacing:-.01em}
	.pca .cu i{font-style:normal;font-family:"DM Mono",monospace;font-size:11px;
		letter-spacing:.08em;text-transform:uppercase;color:var(--tenue)}
	.celdas{display:flex;gap:4px}
	.cel{width:24px;height:24px;display:grid;place-items:center;border:1px solid var(--raya2);
		font-family:"DM Mono",monospace;font-size:11px;color:var(--pale)}
	.cel.lleno{background:var(--violeta);border-color:var(--violeta);color:var(--hoja)}
	.cel.fuera{border-style:dashed;opacity:.45}
	.pca .num{font-size:14.5px;color:var(--texto)}
	.pca .num b{color:var(--tinta);font-weight:600}
	.pca .meta{font-family:"DM Mono",monospace;font-size:11.5px;letter-spacing:.04em;color:var(--tenue)}

	.entrega h3{font-family:"DM Mono",monospace;font-size:11.5px;letter-spacing:.14em;
		text-transform:uppercase;color:var(--tenue);margin:20px 0 9px;font-weight:500}
	.lista{display:grid;gap:1px;background:var(--raya);border:1px solid var(--raya)}
	.it{display:grid;grid-template-columns:32px 1fr auto;gap:12px;align-items:center;
		background:var(--hoja);padding:12px 16px;text-decoration:none}
	a.it:hover{background:var(--violeta-w)}
	.marca{font-size:17px;color:var(--raya2);text-align:center;line-height:1}
	.it.ok .marca{color:var(--violeta)}
	.it.medio .marca{color:var(--epa)}
	.it b{display:block;font-size:15.5px;color:var(--tinta);font-weight:600}
	.it .pie{display:block;font-size:13.5px;color:var(--tenue);line-height:1.4;margin-top:2px}
	.it .dato{font-family:"DM Mono",monospace;font-size:11.5px;letter-spacing:.04em;
		color:var(--tenue);white-space:nowrap}
	.it.ok .dato{color:var(--violeta)}

	.curso{margin-bottom:30px}
	.curso header{display:flex;align-items:baseline;gap:14px;flex-wrap:wrap;
		border-bottom:2px solid var(--raya2);padding-bottom:8px;margin-bottom:14px}
	.curso h2{font-family:"Bricolage Grotesque",Georgia,serif;font-weight:700;font-size:1.3rem;
		color:var(--tinta);margin:0;letter-spacing:-.02em}
	.epa{font-family:"DM Mono",monospace;font-size:12px;letter-spacing:.06em;
		color:var(--epa);border:1px solid var(--epa);padding:3px 8px;text-decoration:none}
	.epa:hover{background:var(--epa-w)}

	.materias{display:grid;gap:12px}
	.materia{display:grid;grid-template-columns:250px 1fr;gap:20px;align-items:center;
		background:var(--hoja);border:1px solid var(--raya);border-left:3px solid;
		padding:14px 18px;box-shadow:var(--sombra)}
	@media(max-width:820px){.materia{grid-template-columns:1fr;gap:12px}}
	.materia.m{border-left-color:var(--mat)}
	.materia.i{border-left-color:var(--inf)}
	.materia.e{border-left-color:var(--epa)}
	.materia h3{font-family:"Bricolage Grotesque",Georgia,serif;font-weight:600;font-size:1.08rem;
		color:var(--tinta);margin:0 0 3px;letter-spacing:-.01em}
	.profes{margin:0;font-size:14.5px;color:var(--texto)}
	.carga{margin:2px 0 0;font-family:"DM Mono",monospace;font-size:12px;
		letter-spacing:.05em;color:var(--tenue)}

	.tramos{display:grid;grid-template-columns:1fr 1fr;gap:12px}
	@media(max-width:620px){.tramos{grid-template-columns:1fr}}
	.tramo{display:flex;flex-direction:column;gap:6px;text-decoration:none;
		border:1px solid var(--raya2);padding:11px 13px;background:var(--papel)}
	a.tramo:hover{border-color:var(--violeta);background:var(--violeta-w)}
	.cu{font-family:"DM Mono",monospace;font-size:14px;font-weight:500;color:var(--tinta);
		display:flex;align-items:baseline;gap:8px}
	.cu i{font-style:normal;font-size:11px;letter-spacing:.1em;text-transform:uppercase;
		color:var(--tenue)}
	.barra{height:9px;background:var(--franja);border:1px solid var(--raya);overflow:hidden}
	.barra span{display:block;height:100%;background:var(--violeta)}
	.tramo.excede .barra span{background:var(--inf)}
	.num{font-size:14.5px;color:var(--texto)}
	.num b{color:var(--tinta);font-weight:600}
	.num em{font-style:normal;font-family:"DM Mono",monospace;font-size:12px;
		letter-spacing:.06em;color:var(--inf);margin-left:6px}
	.meta{font-family:"DM Mono",monospace;font-size:12px;letter-spacing:.05em;color:var(--tenue)}
	.meta .falta{font-style:normal;color:var(--epa)}

	.tramo.vacio{border-style:dashed;background:none;align-items:flex-start}
	.disp{font-size:14px;color:var(--tenue);line-height:1.35}
	.tramo.vacio button{background:none;border:1px solid var(--violeta);color:var(--violeta);
		font-family:"DM Mono",monospace;font-size:12.5px;letter-spacing:.09em;text-transform:uppercase;
		padding:5px 12px;cursor:pointer;margin-top:2px}
	.tramo.vacio button:hover{background:var(--violeta);color:var(--hoja)}

	.pie{font-family:"DM Mono",monospace;font-size:12.5px;color:var(--tenue);line-height:1.6;
		margin-top:30px;padding-top:18px;border-top:1px solid var(--raya);max-width:70ch}
</style>
