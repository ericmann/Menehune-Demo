/**
 * Define the wrapper for a web worker.
 *
 * The Minion class is exposed as the window.Menehune.Minon object.
 *
 * @since 0.1
 */
( function( window, $, undefined ) {
	var document = window.document,
		$document = $( document );

	/**
	 * Web worker wrapper.
	 *
	 * @param {string} script Source of the worker.
	 *
	 * @constructor
	 */
	function Minion( script ) {
		var SELF = this,
			worker,
			working = false,
			builtIns = [ 'setData' ];

		SELF.__defineGetter__( 'available', function() {
			return ! working;
		} );


		worker = new window.Worker( script );

		/**
		 * Set up the worker communication handler.
		 *
		 * @param {event} e
		 */
		worker.onmessage = function ( e ) {
			var data = JSON.parse( e.data ),
				task = data.task,
				payload = data.payload;

			working = false;

			if ( undefined !== task && -1 === builtIns.indexOf( task ) ) {
				$document.trigger( 'menehune.return', [ payload ] );
			}

			$document.trigger( 'menehune.available', [ SELF ] );
		};

		/**
		 * Send a message to the embedded web worker.
		 *
		 * @param {object} data Data array to pass to the worker. Must include a `job` element to identify the task.
		 */
		SELF.postMessage = function postMessage( data ) {
			// Built-in tasks will not hold up the worker.
			if ( builtIns.indexOf( data.job ) !== 0 ) {
				working = true;
			}

			worker.postMessage( JSON.stringify( data ) )
		};

		/**
		 * Terminate the worker.
		 */
		SELF.terminate = function() {
			worker.terminate();
			working = false;
			worker = undefined;
		};
	}

	window.Menehune = window.Menehune || {};
	window.Menehune.Minion = Minion;
} )( window, jQuery );