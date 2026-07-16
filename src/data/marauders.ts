import { siteConfig } from './site';

export const maraudersImages = {
	hero: '/images/hero.webp',
	cover: '/images/cover.webp',
	logo: siteConfig.logo,
	product: [
		{ src: '/images/product-2.webp', alt: 'Marauders gameplay preview used on the product page' },
		{ src: '/images/product-3.webp', alt: 'Marauders combat scene preview' },
		{ src: '/images/product-4.webp', alt: 'Marauders environment preview' },
		{ src: '/images/product-1.webp', alt: 'Marauders beta gameplay preview' },
		{ src: '/images/product-6.webp', alt: 'Marauders ship combat preview' },
		{ src: '/images/cover.webp', alt: 'Marauders raid scene preview' },
	],
	gallery: [
		{ src: '/images/hero.webp', alt: 'Marauders showcase preview', featured: true },
		{ src: '/images/product-2.webp', alt: 'Marauders merchant ship preview' },
		{ src: '/images/product-3.webp', alt: 'Marauders boarding action preview' },
		{ src: '/images/product-4.webp', alt: 'Marauders terraformer preview' },
		{ src: '/images/product-1.webp', alt: 'Marauders beta gameplay preview' },
		{ src: '/images/product-6.webp', alt: 'Marauders ship raid preview' },
		{ src: '/images/product-7.webp', alt: 'Marauders space combat preview' },
	],
} as const;
