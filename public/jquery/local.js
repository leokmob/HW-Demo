$(function() {
	
	
			$("#dialog-preview").dialog({ 
				autoOpen: false,
				title: 'Preview Deal',
				modal: true,
				width: 460 
				});
			
			$('#btn-preview-deal').click(function() {
				$("#dialog-preview").dialog('open');
				// prevent the default action, e.g., following a link
				return false;
			});

			$( "#tabs" ).tabs();
			
			$("nav > ul").menu();
	

	
			$("[data-role=button]").button();
			$("#btn-preview-deal").button({
				
				icons: {
					primary: "ui-icon-search"
				}
			});
	
			
			$("#btn-push-deal").button({
				
				icons: {
					primary: "ui-icon-arrowthick-1-e"
				}
			});
				
			$("#btn-save-deal").button({
				
				icons: {
					primary: "ui-icon-disk"
				}
			});
		
			$( ".deals" ).sortable({
				placeholder: "ui-state-highlight"
			});
			$( ".deals" ).disableSelection();
			
			$( ".toolbar.sort > button" ).button({
				icons: {
	                secondary: "ui-icon-triangle-1-s"
	            }
			})
			
			$( ".toolbar > a" ).button({
			icons: {
                primary: "ui-icon-triangle-1-w"
            	}
			})
			
		
			$( ".deal-location-btns" ).buttonset();
			
			
			$("button.icon-edit").button({
				
				icons: {
					primary: "ui-icon-pencil"
				}
			});
			$("button.icon-delete").button({
				
				icons: {
					primary: "ui-icon-minus"
				}
			});
				
			$('#deal-date').datetimepicker({
				ampm: true
			});
		
			$('[type=datetimeui]').datetimepicker({
				ampm: true
			});
		
			$("[required=required]").parent().prepend("<span class='sym-required'>*</span>");
						
			$("#deal-status").buttonset();
			
			

			
			
			
			
		});