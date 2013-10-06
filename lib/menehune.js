( function( window, $, undefined ) {
	var document = window.document,
		$document = $( document );

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

			$document.trigger( 'menehune.return', e.data );
		};

		SELF.postMessage = function ( data ) {
			if ( 'setData' !== data.job ) {
				working = true;
			}
			worker.postMessage( JSON.stringify( data ) );
		};

		SELF.terminate = function() {
			worker.terminate();
		};
	}

	/**
	 * Wrapper for worker objects.
	 *
	 * @constructor
	 */
	function Workers( script ) {
		var SELF = this,
			working_workers = 0,
			workers = [],
			jobs = [];

		function run_job() {
			var worker, breaker = 0;
			while ( false === ( worker = get_worker() ) ) { }

			if ( jobs.length > 0 ) {
				var job = jobs.pop();
				working_workers++;
				worker.postMessage( job );
			} else {
				if ( 0 === working_workers) {
					// All jobs done
					$document.trigger( 'menehune.complete' );

					// Respawn workers
					SELF.spawn( workers.length );
				}
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

		SELF.do = function ( job ) {
			jobs.push( job );
		};

		SELF.runQueue = function ( callback ) {
			for ( var i = 0, l = workers.length; i < l; i++ ) {
				window.setTimeout( run_job, 1);
			}

			$document.on( 'menehune.return', function ( e, data ) {
				data = JSON.parse( data );
				working_workers--;

				callback.apply( this, [ data ] );
				window.setTimeout( run_job, 1 );
			} )
		};

		SELF.setCommonData = function ( data ) {
			for ( var i = 0, l = workers.length; i < l; i++ ) {
				var worker = workers[i];

				worker.postMessage( {
					job: 'setData',
					data: data
				} );
			}
		};

		/**
		 * Spawn a certain number of workers.
		 *
		 * @param number
		 */
		SELF.spawn = function( number ) {
			number = number || 1;

			// First, kill all the workers!
			SELF.kill();

			for ( var i = 0; i < number; i++ ) {
				workers.push( new Menehune( script ) );
			}
		};

		/**
		 * Kill all the workers
		 */
		SELF.kill = function() {
			while( workers.length > 0 ) {
				var worker = workers.pop();

				worker.terminate();
			}
		}
	}

	window.Workers = Workers;
} )( window, jQuery );