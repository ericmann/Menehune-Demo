( function( window, $, undefined ) {
	var document = window.document,
		target = document.getElementById( 'targettext' ), $target = $( target ),
		current = document.getElementById( 'currenttext' ), $current = $( current ),
		generation = document.getElementById( 'generation' ), $generation = $( generation ),
		genpersec = document.getElementById( 'gps' ), $genpersec = $( genpersec ),
		status = document.getElementById( 'status' ), $status = $( status ),
		startbtn = document.getElementById( 'startbutton' ), $startbtn = $( startbtn ),
		cancelbtn = document.getElementById( 'cancelbutton' ), $cancelbtn = $( cancelbtn ),
		useWorkers = document.getElementById( 'useworkers' ), $useWorkers = $( useWorkers );
		
	var shakespeare = 'To be or not to be, that is the question;\n'
		+ 'Whether \'tis nobler in the mind to suffer\n'
		+ 'The slings and arrows of outrageous fortune,\n'
		+ 'Or to take arms against a sea of troubles,\n'
		+ 'And by opposing, end them.';
		
	$target.val( shakespeare );
	
	var monkeys = {
		interval: null,
		startTyping: function( text ) {
			var genetics = new window.Genetics( text ),
				bestGenome = null,
				started = Math.floor( Date.now() / 1000 );

			// Display status
			monkeys.started( text );

			var generation = 1,
				update = undefined;
			function doNext() {
				genetics.moveNext( function () {
					var gps = generation / Math.max( 1, Math.floor( Date.now() / 1000 ) - started );

					if ( true ) {//null === bestGenome || genetics.currentBest.fitness < bestGenome.fitness ) {
						bestGenome = genetics.currentBest;

						if ( undefined === update ) {
							update = window.setTimeout( function() {
								monkeys.updateProgress( bestGenome.text, generation, gps );
								update = undefined;
							}, 200 );
						}

						if ( 0 === bestGenome.fitness ) {
							monkeys.complete();
							clearTimeout( monkeys.interval );
							return;
						}
					}

					//monkeys.updateProgress( bestGenome.text, generation, gps );

					generation += 1;

					if ( $useWorkers.is( ':checked' ) ) {
						doNext();
					} else {
						monkeys.interval = window.setTimeout( doNext, 1 );
					}
				} );
			}
			doNext();


			/*for( var generation = 1; ; generation++ ) {
				genetics.moveNext();

				if ( null === bestGenome || genetics.currentBest.fitness < bestGenome.fitness ) {
					bestGenome = genetics.currentBest;

					var gps = generation / Math.max( 1, Math.floor( Date.now() / 1000 ) - started );
					monkeys.updateProgress( bestGenome.text, generation, gps );

					if ( 0 === bestGenome.fitness ) {
						monkeys.complete();
						break;
					}
				}
			}*/

		},
		stopTyping: function() {
			// Kill workers
			clearTimeout( monkeys.interval );
			
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