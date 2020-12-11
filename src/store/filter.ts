import {Brand, Link, Model, Series} from './model';
import {config} from '../config';

/**
 * Returns true if the brand should be checked for stock
 *
 * @param brand The brand of the GPU
 */
function filterBrand(brand: Brand): boolean {
	if (config.merchandise?.brands === undefined) {
		return true;
	}

	return config.merchandise?.brands?.includes(brand) ?? false;
}

/**
 * Returns true if the model should be checked for stock
 *
 * @param model The model of the GPU
 * @param series The series of the GPU
 */
function filterModel(model: Model, series: Series): boolean {
	if (config.merchandise?.models === undefined) {
		return true;
	}

	const models =
		config.merchandise.models.filter((m) => {
			if (m.series) {
				return (
					m.name === model &&
					m.series.some((s) => {
						const one = s.name;
						return one === series;
					})
				);
			}

			return m.name === model;
		}) ?? [];
	return models.length > 0;
}

/**
 * Returns true if the series should be checked for stock
 *
 * @param series The series of the GPU
 */
export function filterSeries(series: Series): boolean {
	if (config.merchandise?.series === undefined) {
		return true;
	}

	return config.merchandise.series.some((s) => s.name === series) ?? false;
}

/**
 * Returns true if the link should be checked for stock
 *
 * @param link The store link of the GPU
 */
export function filterStoreLink(link: Link): boolean {
	return (
		filterBrand(link.brand) &&
		filterModel(link.model, link.series) &&
		filterSeries(link.series)
	);
}
