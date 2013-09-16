( function( window, undefined ) {
	/**
	 * Represent a single genome.
	 *
	 * @param {string} text
	 * @param {string} targetText
	 * @constructor
	 */
	function Genome( text, targetText) {
		var SELF = this,
			fitness;

		function recomputeFitness() {
			if ( null !== text && null !== targetText ) {
				var diffs = 0;
				for ( var i = 0, l = targetText.length; i < l; i++ ) {
					if ( targetText[i] !== text[i] ) {
						diffs++;
					}

					fitness = diffs;
				}
			} else {
				fitness = Number.MAX_VALUE;
			}
		}

		SELF.__defineGetter__( 'text', function() {
			return text;
		} );

		SELF.__defineSetter__( 'text', function( value ) {
			text = value;
			recomputeFitness();
		} );

		SELF.__defineGetter__( 'targetText', function() {
			return targetText;
		} );

		SELF.__defineSetter__( 'targetText', function( value ) {
			targetText = value;
			recomputeFitness();
		} );

		SELF.__defineGetter__( 'fitness', function() {
			return fitness;
		} );

		// Initialize fitness
		recomputeFitness();
	}

	/**
	 *
	 * @param {string}           targetText
	 * @param {object|undefined} settings
	 * @constructor
	 */
	window.Genetics = function( targetText, settings ) {
		var SELF = this,
			_validChars = [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w',
				'x', 'y', 'z', ' ', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V',
				'W', 'X', 'Y', 'Z', ';', '\'', ',', '.', '\n' ],
			_currentPopulation = null;

		// Set default settings
		settings = settings || {};
		settings.populationSize = settings.populationSize || 400;
		settings.mutationProbability = settings.mutationProbability || 0.01;
		settings.crossoverProbability = settings.crossoverProbability || 0.87;

		/**
		 * Create a random genome so we can keep processing.
		 *
		 * @return {Genome}
		 */
		function createRandomGenome() {
			var genome = '';

			for( var i = 0, l = targetText.length; i < l; i++ ) {
				genome += _validChars[ Math.floor( Math.random() * _validChars.length ) ];
			}

			return new Genome( genome, targetText );
		}

		/**
		 * Create a new population at random.
		 *
		 * @return {array}
		 */
		function createRandomPopulation() {
			var population = [];

			for ( var i = 0; i < settings.populationSize; i++ ) {
				var member = createRandomGenome();
				population.push( member );
			}

			return population;
		}

		/**
		 * Create the next generation of monkeys based on the fitness of the current generation.
		 *
		 * @return {array}
		 */
		function createNextGeneration() {
			var i, l = _currentPopulation.length,
				maxFitness = 0,
				sumOfMaxMinusFitness = 0;

			for ( i = 0; i < l; i++ ) {
				maxFitness = Math.max( maxFitness, _currentPopulation[i].fitness );
			}
			maxFitness += 1;

			for ( i = 0; i < l; i++ ) {
				sumOfMaxMinusFitness += ( maxFitness - _currentPopulation[i].fitness );
			}

			// Create children
			var children = [];
			for ( i = 0, l = settings.populationSize / 2; i < l; i++ ) {
				var twins = createChildren(
					findRandomHighQualityParent( sumOfMaxMinusFitness, maxFitness ),
					findRandomHighQualityParent( sumOfMaxMinusFitness, maxFitness )
				);

				children.push( twins[0] );
				children.push( twins[1] );
			}

			return children;
		}

		/**
		 * Create a pair of children based on a given mother and father genome.
		 *
		 * @param {Genome} mother
		 * @param {Genome} father
		 * @returns {Array}
		 */
		function createChildren( mother, father ) {
			var child1, child2;

			if ( Math.random() < settings.crossoverProbability ) {
				var crossed = crossover( mother, father );
				child1 = crossed[0];
				child2 = crossed[1];
			} else {
				child1 = mother;
				child2 = father;
			}

			// Potentially mutate one or both children
			if ( Math.random() < settings.mutationProbability ) child1 = mutate( child1 );
			if ( Math.random() < settings.mutationProbability ) child2 = mutate( child2 );

			return [ child1, child2 ];
		}

		/**
		 * Create a mutation by crossing over genes at a random point.
		 *
		 * @param {Genome} mother
		 * @param {Genome} father
		 * @returns {Array}
		 */
		function crossover( mother, father ) {
			var crossoverPoint = Math.floor( Math.random() * mother.text.length ) + 1,
			    child1 = new Genome( mother.text.substring( 0, crossoverPoint ) + father.text.substring( crossoverPoint ), targetText ),
				child2 = new Genome( father.text.substring( 0, crossoverPoint ) + mother.text.substring( crossoverPoint ), targetText );

			return [ child1, child2 ];
		}

		/**
		 * Produce a mutation
		 *
		 * @param {Genome} child
		 * @return {Genome}
		 */
		function mutate( child ) {
			var text = child.text;

			text[ Math.floor( Math.random() * text.length ) ] = _validChars[ Math.floor( Math.random() * _validChars.length ) ];
			child.text = text;

			return child;
		}

		/**
		 * Find a high-fitness parent somewhere in the population.
		 *
		 * @param {number} sumOfMaxMinusFitness
		 * @param {number} max
		 * @returns {Genome}
		 */
		function findRandomHighQualityParent( sumOfMaxMinusFitness, max ) {
			var val = Math.random() * sumOfMaxMinusFitness;
			for( var i = 0, l = _currentPopulation.length; i < l; i++ ) {
				var maxMinusFitness = max - _currentPopulation[i].fitness;
				if ( val < maxMinusFitness ) return _currentPopulation[i];
				val -= maxMinusFitness;
			}

			throw 'Not to be, apparently.';
		}

		/**
		 * Actually move to the next generation
		 */
		SELF.moveNext = function() {
			// If this is the first iteration, create a random population
			if ( null === _currentPopulation ) {
				_currentPopulation = createRandomPopulation();
			} else {
				_currentPopulation = createNextGeneration();
			}
		};

		SELF.__defineGetter__( 'currentBest', function() {
			return _currentPopulation[0];
		} );

		SELF.__defineGetter__( 'random', function() {
			return _currentPopulation[ Math.floor( Math.random() * _currentPopulation.length ) ];
		} );
	}
} )( window );