( function( window, $, undefined ) {
	var document = window.document,
		$document = $( document ),
		target = document.getElementById( 'targettext' ), $target = $( target ),
		current = document.getElementById( 'currenttext' ), $current = $( current ),
		generation = document.getElementById( 'generation' ), $generation = $( generation ),
		genpersec = document.getElementById( 'gps' ), $genpersec = $( genpersec ),
		status = document.getElementById( 'status' ), $status = $( status ),
		startbtn = document.getElementById( 'startbutton' ), $startbtn = $( startbtn ),
		cancelbtn = document.getElementById( 'cancelbutton' ), $cancelbtn = $( cancelbtn ),
		useWorkers = $( document.getElementById( 'useworkers' ) ).is( ':checked' );

	// Initial target text that our monkeys will attempt to type.
	var shakespeare = 'To be or not to be, that is the question;\n'
		+ 'Whether \'tis nobler in the mind to suffer\n'
		+ 'The slings and arrows of outrageous fortune,\n'
		+ 'Or to take arms against a sea of troubles,\n'
		+ 'And by opposing, end them.';

	// Set the value of our "target" textbox to the be Shakespeare quote above.
	$target.val( shakespeare );

	// Queue up the Menehune library and add workers to it.
	var workers = new window.Workers( 'lib/worker.js' );
	workers.spawn( 3 );


	var iteration = 1,
		interval = null,
		update = undefined,
		genetics = null,
		started = null,
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
		var gps = iteration / Math.max( 1, Math.floor( Date.now() / 1000 ) - started );

		if ( true ) {//null === bestGenome || genetics.currentBest.fitness < bestGenome.fitness ) {
			bestGenome = genetics.currentBest;

			if ( undefined === update ) {
				update = window.setTimeout( function() {
					monkeys.updateProgress( bestGenome.text, iteration, gps );
					update = undefined;
				}, 200 );
			}

			if ( 0 === bestGenome.fitness ) {
				monkeys.complete();
				clearTimeout( interval );
				return;
			}
		}

		//monkeys.updateProgress( bestGenome.text, generation, gps );

		iteration += 1;

		interval = window.setTimeout( doNext, 100 );
	}
	
	var monkeys = window.monkeys = {
		startTyping: function( text ) {
			genetics = new window.Genetics( text, { useWorkers: useWorkers } );

			bestGenome = null;
			started = Math.floor( Date.now() / 1000 );

			// Display status
			monkeys.started( text );

			doNext();
		},
		stopTyping: function() {
			// Kill workers
			clearTimeout( interval );
			workers.kill();
			
			// Display status
			monkeys.cancelled();
		},
		updateProgress: function( text, gen, gps ) {
			$current.val( text );
			$generation.text( gen );
			$genpersec.text( gps );
		},
		started: function( startTarget ) {
			$status.text( 'Working ...' );
			$target.val( startTarget );
			$cancelbtn.removeAttr( 'disabled' );
		},
		cancelled: function() {
			$status.text( 'Cancelled' );
			$cancelbtn.attr( 'disabled', 'disabled' );
		},
		complete: function() {
			$status.text( 'Done' );
			$cancelbtn.attr( 'disabled', 'disabled' );
		}
	};
	
	$startbtn.on( 'click', function( event ) {
		$status.text( 'Queued ...' );
		monkeys.startTyping( $target.val() );
	} );
	
	$cancelbtn.on( 'click', function( event ) {
		monkeys.stopTyping();
	} );
} )( window, jQuery );