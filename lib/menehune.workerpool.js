( function( window, $, undefined ) {
	var document = window.document,
		$document = $( document ),
		Minion = window.Menehune.Minion;

	/**
	 * Wrapper for worker objects.
	 *
	 * @constructor
	 */
	function WorkerPool( script ) {
		var SELF = this,
			working_workers = 0,
			workers = [],
			jobs = [];

		function run_job( e, worker ) {
			if ( undefined === worker ) {
				worker = get_worker();
			}

			working_workers -= 1;
			working_workers = Math.max( working_workers, 0 );

			if ( jobs.length > 0 && ! worker  ) {
				window.console.log( 'no worker' );
				setTimeout( run_job, 1 );
				return;
			} else if ( jobs.length > 0 ) {
				var job = jobs.pop();
				working_workers++;
				worker.postMessage( job );
			} else if ( 0 === working_workers) {
				// All jobs done
				$document.trigger( 'menehune.complete' );

				// Respawn workers
				SELF.spawn( workers.length );
			}
		}

		$document.on( 'menehune.available', run_job );

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

		/**
		 * Add a new job to the worker queue.
		 *
		 * @param {object} job
		 */
		SELF.do = function ( job ) {
			jobs.push( job );
		};

		/**
		 * Process all queued jobs. When complete, fire the passed-in callback.
		 *
		 * @param {function} callback
		 */
		SELF.runQueue = function ( callback ) {
			for ( var i = 0, l = workers.length; i < l; i++ ) {
				window.setTimeout( run_job, 1);
			}

			$document.on( 'menehune.return', function ( e, data ) {
				data = JSON.parse( data );
				working_workers--;

				callback.apply( this, [ data ] );
			} )
		};

		/**
		 * Set up common (i.e. global) data and constants for all worker objects.
		 *
		 * @param {object} data
		 */
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
		 * @param {number} number
		 */
		SELF.spawn = function( number ) {
			number = number || 1;

			// First, kill all the workers!
			SELF.kill();

			for ( var i = 0; i < number; i++ ) {
				workers.push( new Minion( script ) );
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

	window.Menehune.WorkerPool = WorkerPool;
} )( window, jQuery );