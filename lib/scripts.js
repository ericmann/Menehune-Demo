( function( window, $, undefined ) {
	var document = window.document,
		$document = $( document ),

		// Project object shortcuts
		Pool = window.Menehune.WorkerPool,
		Genetics = window.Shakespeare.Genetics,

		// UI elements
		$target = $( document.getElementById( 'targettext' ) ),
		$current = $( document.getElementById( 'currenttext' ) ),
		$generation = $( document.getElementById( 'generation' ) ),
		$genpersec = $( document.getElementById( 'gps' ) ),
		$status = $( document.getElementById( 'status' ) ),
		$startbtn = $( document.getElementById( 'startbutton' ) ),
		$cancelbtn = $( document.getElementById( 'cancelbutton' ) ),
		$useWorkers = $( document.getElementById( 'useworkers' ) ),

		// Web worker wrapper object (if used)
		workers,

		// Initial target text that our monkeys will attempt to type
		shakespeare = 'To be or not to be, that is the question;\n'
			+ 'Whether \'tis nobler in the mind to suffer\n'
			+ 'The slings and arrows of outrageous fortune,\n'
			+ 'Or to take arms against a sea of troubles,\n'
			+ 'And by opposing, end them.',

		// Variables used by the iterative processor
		iteration = 1,
		lastUpdate = 0,
		interval = null,
		update = undefined,
		genetics = null,
		startTime = null,
		bestGenome = null;

	/**
	 * Define a function to build the next generation of monkeys
	 */
	function doNext() {
		genetics.moveNext( doneNext );
	}

	/**
	 * Process an update after the Genetics algorithm has returned some data.
	 */
	function doneNext() {
		var gps = iteration / Math.max( 1, Math.floor( Date.now() / 1000 ) - startTime );

		if ( null === bestGenome || ( undefined !== genetics.currentBest && genetics.currentBest.fitness < bestGenome.fitness ) || ( iteration - lastUpdate > 5 ) ) {
			lastUpdate = iteration;

			bestGenome = genetics.currentBest;

			if ( undefined === update ) {
				update = window.setTimeout( function() {
					updateProgress( bestGenome.text, iteration, gps );
					update = undefined;
				}, 200 );
			}

			if ( 0 === bestGenome.fitness ) {
				complete();
				clearTimeout( interval );
				return;
			}
		}

		iteration += 1;

		interval = window.setTimeout( doNext, 0 );
	}

	/**
	 * Full speed ahead!
	 *
	 * Queue up the process to begin breeding monkeys attempting to type a specific text string.
	 *
	 * @param {string} text Target text for the monkeys to type.
	 */
	function startTyping( text ) {
		// Clear out any existing data
		updateProgress( '', 0, 0 );

		// Are we using web workers?
		var useWorkers = $useWorkers.is( ':checked' );
		if ( useWorkers ) {
			// Queue up the Menehune library and add workers to it.
			workers = window.workerpool = new Pool( 'lib/worker.js' );
			workers.spawn( 1 );
		}

		genetics = new Genetics( text, { useWorkers: useWorkers } );

		bestGenome = null;
		startTime = Math.floor( Date.now() / 1000 );

		// Display status
		started( text );

		doNext();
	}

	/**
	 * Stop typing by killing any web workers that we have and clearing any intervals.
	 */
	function stopTyping() {
		// Kill workers
		clearTimeout( interval );

		if ( undefined !== workers && undefined !== workers.kill )
			workers.kill();

		// Display status
		cancelled();
	}

	/**
	 * Update the UI with the current process of the operation.
	 *
	 * @param {string} text Current best attempt
	 * @param {number} gen  Which generation are we on?
	 * @param {number} gps  How efficient is the processor?
	 */
	function updateProgress( text, gen, gps ) {
		$current.val( text );
		$generation.text( gen );
		$genpersec.text( gps );
	}

	/**
	 * Update the UI to indicate that the process has started and make the cancel button available.
	 *
	 * @param {string} startTarget
	 */
	function started( startTarget ) {
		$status.text( 'Working ...' );
		$target.val( startTarget );
		$cancelbtn.removeAttr( 'disabled' );
		$startbtn.attr( 'disabled', 'disabled' );
	}

	/**
	 * Update UI to indicate that the process has been cancelled.
	 */
	function cancelled() {
		$status.text( 'Cancelled' );
		$cancelbtn.attr( 'disabled', 'disabled' );
		$startbtn.removeAttr( 'disabled' );

		window.setTimeout( function() {
			iteration = 1;
			lastUpdate = 0;
		}, 200 );
	}

	/**
	 * Update UI to indicate that the monkeys are finished.
	 */
	function complete() {
		$status.text( 'Done' );
		$cancelbtn.attr( 'disabled', 'disabled' );
		$startbtn.removeAttr( 'disabled' );
	}

	// Set the value of our "target" textbox to the be Shakespeare quote above.
	$target.val( shakespeare );

	// Wire up start button click events
	$startbtn.on( 'click', function( event ) {
		$status.text( 'Queued ...' );
		startTyping( $target.val() );
	} );

	// Wire up cancel button click events.
	$cancelbtn.on( 'click', function( event ) {
		stopTyping();
	} );
} )( window, jQuery );