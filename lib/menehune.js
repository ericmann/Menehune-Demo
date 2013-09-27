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
			working = true;
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
			workers = [],
			jobs = [];

		function run_job() {
			var worker;
			while ( false === ( worker = get_worker() ) ) {}

			if ( jobs.length > 0 ) {
				worker.postMessage( jobs.pop() );
			} else {
				// All jobs done
				$document.trigger( 'menehune.complete' );
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
				run_job();
			}

			$document.on( 'menehune.return', function ( e, data ) {
				data = JSON.parse( data );

				callback.apply( this, [ data ] );
				run_job();
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