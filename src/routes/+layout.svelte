<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	let { children } = $props();

	/* Tema: auto sigue al sistema, claro y oscuro mandan. La elección
	   se guarda y la aplica un script en app.html antes de pintar. */
	const TEMAS = [
		{ id: 'auto', glifo: '◐', rot: 'automático' },
		{ id: 'light', glifo: '☀', rot: 'claro' },
		{ id: 'dark', glifo: '☾', rot: 'oscuro' }
	] as const;
	let tema = $state<'auto' | 'light' | 'dark'>('auto');
	const actual = $derived(TEMAS.find((t) => t.id === tema) ?? TEMAS[0]);

	onMount(() => {
		try {
			const g = localStorage.getItem('areal:tema');
			if (g === 'light' || g === 'dark') tema = g;
		} catch (e) { /* modo privado */ }
	});

	function ciclarTema() {
		tema = tema === 'auto' ? 'light' : tema === 'light' ? 'dark' : 'auto';
		try {
			if (tema === 'auto') {
				localStorage.removeItem('areal:tema');
				delete document.documentElement.dataset.theme;
			} else {
				localStorage.setItem('areal:tema', tema);
				document.documentElement.dataset.theme = tema;
			}
		} catch (e) { /* modo privado */ }
	}

	/* Dos clases de sección: las de consulta, que sólo se leen, y las de
	   gestión, donde se escribe. Las segundas cuelgan de Planificaciones. */
	type Item = { href: string; rot: string; pie?: string };
	const MENU: (Item & { hijos?: Item[] })[] = [
		{ href: '/',            rot: 'Portada' },
		{ href: '/programa',    rot: 'El programa' },
		{ href: '/mapa',        rot: 'Mapa del área' },
		{
			href: '/planificaciones', rot: 'Planificaciones',
			hijos: [
				{ href: '/trayecto', rot: 'Trayecto',
					pie: 'Lo esperable, lo planificado y lo que se dio, nudo por nudo' },
				{ href: '/planificaciones', rot: 'Por materia',
					pie: 'Lo que cada espacio va a hacer, cuatrimestre por cuatrimestre' },
				{ href: '/epa', rot: 'EPA',
					pie: 'Los espacios articulados que el área sostiene' },
				{ href: '/reuniones', rot: 'Reuniones',
					pie: 'Encuentros, acuerdos y si se cumplieron' },
				{ href: '/checklist', rot: 'Checklist',
					pie: 'Lo que la escuela le pide al área cada tramo' },
				{ href: '/formularios', rot: 'Formularios',
					pie: 'Lo que contesta cada una' }
			]
		},
		{ href: '/calendario',  rot: 'Calendario' },
		{ href: '/recursero',   rot: 'Recursero' }
	];
	const activo = (h: string) =>
		h === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(h);
	/** Un padre está activo si lo está él o cualquiera de sus hijos. */
	const activoConHijos = (m: (typeof MENU)[number]) =>
		activo(m.href) || (m.hijos ?? []).some((h) => activo(h.href));

	let abierto = $state<string | null>(null);
	// Al navegar se cierra solo: si no, queda desplegado sobre la página nueva.
	$effect(() => { page.url.pathname; abierto = null; });

	/* En la pantalla de entrada no se muestra el menú: todavía no hay sesión. */
	const conMenu = $derived(page.url.pathname !== '/entrar');
	const conSesion = $derived(!!page.data.usuario);
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link rel="stylesheet"
		href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,400;12..96,75..100,600;12..96,75..100,700;12..96,75..100,800&family=Manrope:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" />
	<meta name="color-scheme" content="light dark" />
</svelte:head>

<svelte:window onkeydown={(e) => e.key === 'Escape' && (abierto = null)} />

{#if conMenu}
<nav class="menu" aria-label="Secciones">
	<a class="logo" href="/">Areal</a>
	<span class="donde">{conSesion ? 'Matemática e Informática · Don Jaime de Nevares' : 'Matemática e Informática · Neuquén'}</span>
	<span class="hueco"></span>
	{#if conSesion}
		{#each MENU as m}
			{#if m.hijos}
				<span class="grupo">
					<button type="button" class="padre" class:aqui={activoConHijos(m)}
						aria-expanded={abierto === m.href} aria-haspopup="true"
						onclick={() => (abierto = abierto === m.href ? null : m.href)}>
						{m.rot}<span class="flecha" aria-hidden="true">▾</span>
					</button>
					{#if abierto === m.href}
						<span class="hijos">
							{#each m.hijos as h}
								<a href={h.href} aria-current={activo(h.href) ? 'page' : undefined}>
									<b>{h.rot}</b>
									{#if h.pie}<i>{h.pie}</i>{/if}
								</a>
							{/each}
						</span>
					{/if}
				</span>
			{:else}
				<a href={m.href} aria-current={activo(m.href) ? 'page' : undefined}>{m.rot}</a>
			{/if}
		{/each}
	{:else}
		<a class="entrar" href="/entrar">Entrar</a>
	{/if}
	{#if page.data.usuario?.admin}
		<a href="/usuarias" aria-current={page.url.pathname.startsWith('/usuarias') ? 'page' : undefined}>Usuarias</a>
	{/if}
	{#if page.data.usuario}
		<form method="POST" action="/salir" class="salir">
			<a class="yo" href="/perfil" title="Mi perfil · {page.data.usuario.email}"
				aria-current={page.url.pathname.startsWith('/perfil') ? 'page' : undefined}
				>{page.data.usuario.nombre}</a>
			<button type="submit">Salir</button>
		</form>
	{/if}
	<button type="button" class="tema" onclick={ciclarTema}
		title="Tema {actual.rot} · tocá para cambiar">
		<span aria-hidden="true">{actual.glifo}</span>
		<span class="sr">Tema {actual.rot}, cambiar</span>
	</button>
</nav>
{/if}

{#if abierto}
	<!-- Tapa el resto de la página: un toque afuera cierra el desplegable. -->
	<button type="button" class="tapa" tabindex="-1" aria-label="Cerrar el menú"
		onclick={() => (abierto = null)}></button>
{/if}

{@render children()}

<style>
	.menu{user-select:none;-webkit-user-select:none;
		position:sticky;top:0;z-index:50;display:flex;align-items:center;gap:0;
		flex-wrap:wrap;padding:0 20px;background:var(--papel);
		border-bottom:1px solid var(--raya2);min-height:58px}
	.logo{font-family:"Bricolage Grotesque",Georgia,serif;font-weight:700;font-size:1.2rem;
		color:var(--violeta);text-decoration:none;letter-spacing:-.02em;
		margin-right:10px;font-variation-settings:"wdth" 88}
	.donde{font-family:"DM Mono",ui-monospace,monospace;font-size:12px;letter-spacing:.11em;
		text-transform:uppercase;color:var(--tenue)}
	@media(max-width:1400px){.donde{display:none}}
	.hueco{flex:1}
	.menu a:not(.logo){font-size:15px;font-weight:500;color:var(--tenue);text-decoration:none;
		padding:18px 11px 16px;border-bottom:2px solid transparent;transition:color .12s}
	.menu a:not(.logo):hover{color:var(--tinta)}
	.menu a[aria-current="page"]{color:var(--tinta);font-weight:600;border-bottom-color:var(--violeta)}
	.menu a:focus-visible{outline:2px solid var(--violeta);outline-offset:-3px}
	.grupo{position:relative;display:inline-flex}
	.padre{background:none;border:none;border-bottom:2px solid transparent;cursor:pointer;
		font:inherit;font-size:15px;font-weight:500;color:var(--tenue);
		padding:18px 11px 16px;display:inline-flex;align-items:center;gap:5px;transition:color .12s}
	.padre:hover{color:var(--tinta)}
	.padre.aqui{color:var(--tinta);font-weight:600;border-bottom-color:var(--violeta)}
	.padre:focus-visible{outline:2px solid var(--violeta);outline-offset:-3px}
	.flecha{font-size:12px;line-height:1;opacity:.85;transition:transform .12s}
	.padre[aria-expanded="true"]{color:var(--violeta)}
	.padre[aria-expanded="true"] .flecha{transform:rotate(180deg)}
	.hijos{position:absolute;top:100%;left:0;z-index:70;min-width:290px;
		display:flex;flex-direction:column;background:var(--hoja);
		border:1px solid var(--raya2);box-shadow:var(--sombra)}
	.menu .hijos a{display:block;padding:11px 15px;border-bottom:1px solid var(--raya);
		border-left:3px solid transparent}
	.menu .hijos a:last-child{border-bottom:none}
	.menu .hijos a:hover{background:var(--franja)}
	.menu .hijos a[aria-current="page"]{border-left-color:var(--violeta);background:var(--violeta-w)}
	.hijos b{display:block;font-size:15px;font-weight:600;color:var(--tinta)}
	.hijos i{display:block;font-style:normal;font-size:13px;color:var(--tenue);
		margin-top:2px;line-height:1.4}
	/*
	 * Va por DEBAJO de .menu (50). La barra es sticky con z-index, así que arma
	 * su propio contexto de apilado: el z-index:70 de .hijos sólo vale puertas
	 * adentro y desde afuera todo el menú vale 50. Una tapa por encima de ese 50
	 * se lleva los clicks del desplegable.
	 */
	.tapa{position:fixed;inset:0;z-index:40;background:none;border:none;cursor:default}
	.tema{background:none;border:1px solid var(--raya2);cursor:pointer;color:var(--tenue);
		font-size:15px;line-height:1;padding:6px 9px;margin-left:10px}
	.tema:hover{color:var(--tinta);border-color:var(--tinta)}
	.tema:focus-visible{outline:2px solid var(--violeta);outline-offset:2px}
	.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}

	/* En el teléfono la barra se parte en varios renglones y queda pegada arriba
	   comiéndose media pantalla. Achica el paso y suelta el sticky; y el
	   desplegable empuja hacia abajo en vez de flotar, que si el botón quedó a
	   la derecha se dibujaba fuera de la pantalla. */
	@media (max-width: 760px) {
		.menu{position:static;padding:0 12px;min-height:0;row-gap:0}
		.menu a:not(.logo){font-size:14px;padding:10px 8px}
		.padre{font-size:14px;padding:10px 8px}
		.grupo{position:static}
		.hijos{position:static;width:100%;min-width:0;border-left:none;border-right:none;
			box-shadow:none}
		.logo{font-size:1.05rem;margin-right:6px}
		.salir{margin-left:auto}
	}
	.salir{display:flex;align-items:center;gap:8px;margin-left:6px}
	.menu .salir .yo{font-size:13.5px;color:var(--tenue);white-space:nowrap;
		text-decoration:none;padding:0;border:none}
	.menu .salir .yo:hover{color:var(--violeta)}
	.menu .salir .yo[aria-current="page"]{color:var(--violeta);font-weight:600}
	.salir button{background:none;border:1px solid var(--raya2);cursor:pointer;
		font-size:13px;color:var(--tenue);padding:4px 10px}
	.salir button:hover{color:var(--violeta);border-color:var(--violeta)}
	/* Va con .menu adelante: si no, gana «.menu a:not(.logo)» y la letra
	   queda del mismo color que el fondo. */
	.menu a.entrar{background:var(--violeta);color:var(--papel);text-decoration:none;
		font-weight:600;font-size:15px;padding:7px 18px;border-bottom:none}
	.menu a.entrar:hover{filter:brightness(1.08);color:var(--papel)}
</style>
