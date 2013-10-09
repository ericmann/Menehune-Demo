// Import scripts for managing the Genome object and calculating genetics matches
importScripts( 'shakespare.genome.js', 'shakespeare.genetics.js' );

/**
 *
 * @param {string}           targetText
 * @param {object|undefined} settings
 * @constructor
 */
function Genetics() {}

Genetics.prototype = Genetics;

Genetics.prototype.__defineGetter__( 'validChars', function() {
	return [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w',
	         'x', 'y', 'z', ' ', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V',
	         'W', 'X', 'Y', 'Z', ';', '\'', ',', '.', '\n' ];
} );

/**
 * Create a new population at random.
 *
 * @param {Object} settings
 *
 * @return {Array}
 */
Genetics.prototype.createRandomPopulation = function ( settings ) {
	var population = [];

	for ( var i = 0; i < settings.populationSize; i++ ) {
		var member = Genetics.createRandomGenome( settings.targetText );
		population.push( member );
	}

	return population;
};

/**
 * Create a random genome so we can keep processing.
 *
 * @param {String} targetText
 *
 * @return {Genome}
 */
Genetics.prototype.createRandomGenome = function ( targetText ) {
	var genome = '';

	for( var i = 0, l = targetText.length; i < l; i++ ) {
		genome += Genetics.validChars[ Math.floor( Math.random() * Genetics.validChars.length ) ];
	}

	return new Genome( genome, targetText );
};

/**
 * Produce a mutation
 *
 * @param {Genome} child
 * @return {Genome}
 */
Genetics.prototype.mutate = function ( child ) {
	var text = child.text;

	text[ Math.floor( Math.random() * text.length ) ] = Genetics.validChars[ Math.floor( Math.random() * Genetics.validChars.length ) ];
	child.text = text;

	return child;
};

/**
 * Create a mutation by crossing over genes at a random point.
 *
 * @param {Genome} mother
 * @param {Genome} father
 * @param {String} targetText
 *
 * @returns {Array}
 */
Genetics.prototype.crossover = function ( mother, father, targetText ) {
	var crossoverPoint = Math.floor( Math.random() * mother.text.length ) + 1,
		child1 = new Genome( mother.text.substring( 0, crossoverPoint ) + father.text.substring( crossoverPoint ), targetText ),
		child2 = new Genome( father.text.substring( 0, crossoverPoint ) + mother.text.substring( crossoverPoint ), targetText );

	return [ child1, child2 ];
};

/**
 * Find a high-fitness parent somewhere in the population.
 *
 * @param {Number} sumOfMaxMinusFitness
 * @param {Number} max
 * @param {Array} population
 *
 * @returns {Genome}
 */
Genetics.prototype.findRandomHighQualityParent = function ( sumOfMaxMinusFitness, max, population ) {
	var val = Math.random() * sumOfMaxMinusFitness;
	for( var i = 0, l = population.length; i < l; i++ ) {
		var maxMinusFitness = max - population[i].fitness;
		if ( val < maxMinusFitness ) return population[i];
		val -= maxMinusFitness;
	}

	throw 'Not to be, apparently.';
};

/**
 * Create a pair of children based on a given mother and father genome.
 *
 * @param {Genome} mother
 * @param {Genome} father
 * @param {Object} settings
 *
 * @returns {Array}
 */
Genetics.prototype.createChildren = function ( mother, father, settings ) {
	var child1, child2;

	if ( Math.random() < settings.crossoverProbability ) {
		var crossed = Genetics.crossover( mother, father, settings.targetText );
		child1 = crossed[0];
		child2 = crossed[1];
	} else {
		child1 = mother;
		child2 = father;
	}

	// Potentially mutate one or both children
	if ( Math.random() < settings.mutationProbability ) child1 = Genetics.mutate( child1 );
	if ( Math.random() < settings.mutationProbability ) child2 = Genetics.mutate( child2 );

	return [ child1, child2 ];
};

onmessage = function ( e ) {
	var data = JSON.parse( e.data );

	if ( undefined === data.job ) {
		postMessage( JSON.stringify( { error: 'Invalid job' } ) );
		return;
	}

	switch( data.job ) {
		case 'createChildren' :
			var twins = createChildren();

			postMessage( JSON.stringify( twins ) );
			break;
		case 'setData' :
			data = data.data;

			Genetics.prototype.settings = data.settings;
			Genetics.prototype.sumOfMaxMinusFitness = data.sum;
			Genetics.prototype.maxFitness = data.maxFitness;
			Genetics.prototype.population = data.population;
			break;
		default :
			postMessage( JSON.stringfy( { error: 'Invalid job' } ) );
	}
};

function createChildren() {
	var twins = Genetics.createChildren(
		Genetics.findRandomHighQualityParent( Genetics.prototype.sumOfMaxMinusFitness, Genetics.prototype.maxFitness, Genetics.prototype.population ),
		Genetics.findRandomHighQualityParent( Genetics.prototype.sumOfMaxMinusFitness, Genetics.prototype.maxFitness, Genetics.prototype.population ),
		Genetics.prototype.settings
	);

	return twins;
}