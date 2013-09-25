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
		useWorkers = document.getElementById( 'useworkers' ), $useWorkers = $( useWorkers );
		
	var shakespeare = 'To be or not to be, that is the question;\n'
		+ 'Whether \'tis nobler in the mind to suffer\n'
		+ 'The slings and arrows of outrageous fortune,\n'
		+ 'Or to take arms against a sea of troubles,\n'
		+ 'And by opposing, end them.';
		
	$target.val( shakespeare );

	/**
	 *
	 * @param script
	 * @constructor
	 */
	function Menehune( script ) {
		var SELF = this,
			worker,
			working = false;

		SELF.__defineGetter__( 'available', function() {
			return ! working;
		} );

		worker = new Worker( script );

		worker.onmessage = function ( e ) {
			working = false;

			$document.trigger( 'worker.return', e.data );
		};

		SELF.postMessage = function ( data ) {
			working = true;
			worker.postMessage( JSON.stringify( data ) );
		};
	}

	/**
	 *
	 * @constructor
	 */
	function Workers() {
		var SELF = this,
			workers = [
				new Menehune( 'lib/worker.js' ),
				new Menehune( 'lib/worker.js' ),
				new Menehune( 'lib/worker.js' )
			],
			jobs = [];

		function run_job() {
			var worker;
			while ( false === ( worker = get_worker() ) ) {}

			if ( jobs.length > 0 ) {
				worker.postMessage( jobs.pop() );
			} else {
				// All jobs done
				$document.trigger( 'worker.complete' );
			}
		}

		/**
		 * Get the next available worker.
		 *
		 * @returns {Menehune|bool} False if no workers available.
		 */
		function get_worker() {
			for ( var i = 0, l = workers.length; i < l; i ++ ) {
				if ( workers[i].available ) {
					return workers[i];
				}
			}

			return false;
		}

		SELF.do = function( job ) {
			jobs.push( job );
		};

		SELF.runQueue = function( callback ) {
			for ( var i = 0, l = workers.length; i < l; i++ ) {
				run_job();
			}

			$document.on( 'worker.return', function ( e, data ) {
				data = JSON.parse( data );

				callback.apply( this, [ data ] );
				run_job();
			} )
		}
	}
	
	var monkeys = window.monkeys = {
		brood: new Workers(),
		interval: null,
		startTyping: function( text ) {
			var genetics = new window.Genetics( text, { useWorkers: $useWorkers.is( ':checked' ) } ),
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

					monkeys.interval = window.setTimeout( doNext, 1 );
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