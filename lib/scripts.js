( function( window, $, undefined ) {
	var document = window.document,
		target = document.getElementById( 'targettext' ), $target = $( target ),
		current = document.getElementById( 'currenttext' ), $current = $( current ),
		generation = document.getElementById( 'generation' ), $generation = $( generation ),
		genpersec = document.getElementById( 'gps' ), $genpersec = $( genpersec ),
		status = document.getElementById( 'status' ), $status = $( status ),
		startbtn = document.getElementById( 'startbutton' ), $startbtn = $( startbtn ),
		cancelbtn = document.getElementById( 'cancelbutton' ), $cancelbtn = $( cancelbtn );
		
	var shakespeare = 'To be or not to be, that is the question;\n'
		+ 'Whether \'tis nobler in the mind to suffer\n'
		+ 'The slings and arrows of outrageous fortune,\n'
		+ 'Or to take arms against a sea of troubles,\n'
		+ 'And by opposing, end them.';
		
	$target.val( shakespeare );
	
	var monkeys = {
		startTyping: function( text ) {
			// Queue workers
			
			// Display status
			monkeys.started( text );
		},
		stopTyping: function() {
			// Kill workers
			
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