/**
 *
 * librecat main/search page
 *
 */

/**
 * check if alias is already used
 */
$(function () {
$('.check_alias').keyup(function() {
	var object = $(this);
	var val = object.val();
	var id = $(object).data('id');
	$.ajax({
		url: '/get_alias/' + id + '/' + val,
		dataType: 'json',
		success: function(data,textStatus){
			if (data.ok == 0) {
				object.closest('.form-group').addClass('has-error');
			} else {
				object.closest('.form-group').removeClass('has-error');
			}
		},
	});
});
});

$(function() {
    $('.helpme').tooltip({
        html: true,
        trigger: "manual",
    });
	$('.toggle_help').click(function() {
	    if($(this).hasClass('toggled')){
	        $(this).removeClass('toggled');
	        $('.helpme').tooltip('hide');
	    }
	    else{
	        $(this).addClass('toggled');
	        $('.helpme').tooltip('show');
	    }
	});
});

/**
 * Display/hide edit form for author IDs
 *
 * @param direction = [edit|cancel] display or hide form
 */
function editAuthorIds(direction){
	if(direction == "edit"){
		$('.authorIds').css('display','none');
		$('.authorIds_input').attr('style','display:display');
		$('#author_ids_edit').attr('onclick',"editAuthorIds('cancel')");
	}
	else if(direction == "cancel"){
		$('.authorIds').attr('style','display:display');
		$('.authorIds_input').attr('style','display:none');
		$('#author_ids_edit').attr('onclick',"editAuthorIds('edit')");
	}
}

/**
 * Generates and displays link for request_a_copy
 * @param file_id
 * @param pub_id
 */
function generate_link(file_id, pub_id){
	var url = '/rc/' + pub_id + '/' + file_id;
	$.post(url, {approved:1}, function(data){
		var request_url = data.url;
		$("ul[id$='_rac_dd_" + file_id + "'] li input").val(request_url);
		$('ul[id$="_rac_dd_' + file_id + '"]').dropdown('toggle');
	}, 'json');
}


/**
 *
 * Publication Edit Form
 *
 */


/**
 * Section Basic Fields
 */

$(function () {
	$('.change_mode').click(function(){
		if($('#edit_mode').val() == "normal"){
			$('#edit_mode').val('expert');
		}
		else{
			$('#edit_mode').val('normal');
		}
		$('#edit_form').attr('action','/librecat/record/change_mode');
		$('#edit_form').submit();
	});
	$('.change_type').click(function(){
		var sure = confirm("Changing the publication type may result in loss of data if the new type uses different fields from the previous one! Proceed with caution.");
		if(sure){
			var newtype = $(this).data('val');
			$('#id_type').val(newtype);
			$('#id_select_type').remove();
			$('#edit_form').attr('action','/librecat/record/change_mode');
			$('#edit_form').submit();
		}
	});
});


/**
 * Link author name to person account
 */
function link_person(element){
	var type = "";
	type = $(element).attr('data-type');
	var lineId = $(element).attr('id').replace(type + 'link_person_','');

	if($('#' + type + 'Authorized' + lineId).attr('alt') == "Not Authorized"){
		var puburl = '/search_researcher?term=';
		var narrowurl = "";
		var longurl = "";
		var first_name = $('#' + type + 'first_name_' + lineId).val();
		$('#' + type + 'orig_first_name_' + lineId).val(first_name);
		var firstname = first_name.toLowerCase();
		firstname = firstname.replace('\.','');
		var last_name = $('#' + type + 'last_name_' + lineId).val();
		$('#' + type + 'orig_last_name_' + lineId).val(last_name);
		var lastname = last_name.toLowerCase();
		lastname = lastname.replace('\.','');
		if(firstname){
			// if name consists of more than one word, use any and ""
			if(firstname.indexOf(" ") > -1){
				narrowurl += 'firstname any "' + firstname + '"';
				longurl += 'oldfirstname any "' + firstname + '"';
			}
			// if name contains [-äöüß], truncating won't work, so use literal search
			else if(firstname.indexOf("-") > -1 || firstname.indexOf("\u00E4") > -1 || firstname.indexOf("\u00F6") > -1 || firstname.indexOf("\u00FC")> -1 || firstname.indexOf("\u00DF") > -1){
				narrowurl += "firstname=" + firstname;
				longurl += "oldfirstname=" + firstname;
			}
			else {
				narrowurl += "firstname=" + firstname + "*";
				longurl += "oldfirstname=" + firstname + "*";
			}
		}
		if(firstname && lastname){
			narrowurl += " AND ";
			longurl += " AND ";
		}
		if(lastname){
			// if name consists of more than one word, use any and ''
			if(lastname.indexOf(" ") > -1){
				narrowurl += 'lastname any "' + lastname + '"';
				longurl += 'oldlastname any "' + lastname + '"';
			}
			// if name contains [-äöüß], truncating won't work, so use literal search
			else if(lastname.indexOf("-") > -1 || lastname.indexOf("\u00E4") > -1 || lastname.indexOf("\u00F6") > -1 || lastname.indexOf("\u00FC") > -1 || lastname.indexOf("\u00DF") > -1){
				narrowurl += "lastname=" + lastname;
				longurl += "oldlastname=" + lastname;
			}
			else{
				narrowurl += "lastname=*" + lastname + "*";
				longurl += "oldlastname=*" + lastname + "*";
			}
		}
		if(narrowurl != "" && longurl != ""){
			narrowurl = puburl + "(" + narrowurl + ")" + " OR " + "(" + longurl + ")";
		}
		else if(narrowurl != "" && longurl == ""){
			narrowurl = puburl + narrowurl;
		}
		else if(narrowurl == "" && longurl != ""){
			narrowurl = puburl + longurl;
		}

		$.get(narrowurl, function(objJSON) {

			// If only one hit... fill out fields and change img to green
			if(objJSON.length == 1 && (!objJSON[0].old_full_name || !objJSON[0].full_name)){
				var data = objJSON[0];
				var personId = "";
				var orcid = "";
				var first_name = "";
				var last_name = "";

				$.each(data, function(key, value){
					if(key == "_id"){
						personId = value;
					}
					if(key == "first_name"){
						first_name = value;
					}
					if(key == "last_name"){
						last_name = value;
					}
					if(key == "orcid"){
						orcid = value;
					}
				});

				$('#' + type + 'first_name_' + lineId).val(first_name);
				$('#' + type + 'last_name_' + lineId).val(last_name);
				$('#' + type + 'first_name_' + lineId + ', #' + type + 'last_name_' + lineId).attr("readonly", "readonly");
				$('#' + type + 'Authorized' + lineId).attr('src','/images/biAuthorized.png');
				$('#' + type + 'Authorized' + lineId).attr('alt','Authorized');
				$('#' + type + 'first_name_' + lineId + ', #' + type + 'last_name_' + lineId).parent().removeClass("has-error");

				$('#' + type + 'id_' + lineId).val(personId);
				$('#' + type + 'orcid_' + lineId).val(orcid);

				personId = "";
				orcid = "";
				first_name = "";
				last_name = "";
			}

			// If more than one hit... show modal with choices
			else if(objJSON.length > 1 || (objJSON.length == 1 && objJSON[0].old_full_name && objJSON[0].full_name)){
				var container_title = $('#' + type + 'link_person_modal').find('.modal-title').first();
				container_title.html('');
				var title = '<span class="text-default"></span> UniBi author: Choose name';
				var container = $('#' + type + 'link_person_modal').find('.modal-body').first();
				container.html('');
				var table = '<p>Several exact matches for <em>' + firstname + ' ' + lastname + '</em> were found in the staff directory (PEVZ). Click on the number (Person ID) to view the person\'s profile in the PEVZ. Click on the name to link the publication to the publication list of this person and make it visible on his/her personal publication page.</p><table class="table table-striped" id="lineId' + lineId + '"><tr><th>Person ID</th><th>Name</th></tr>';
				var rows = "";
				var table2 = '<table class="table table-striped" id="lineId' + lineId + '"><tr><th>Person ID</th><th>Name</th></tr>';
				var rows2 = "";

				for(var i=0;i<objJSON.length;i++){
					var data = objJSON[i];
					var personId = "";
					var orcid = "";
					var first_name = "";
					var old_first_name = "";
					var last_name = "";
					var old_last_name = "";
					$.each(data, function(key, value){
						if(key == "_id"){
							personId = value;
						}
						if(key == "orcid"){
							orcid = value;
						}
						if(key == "first_name"){
							first_name = value;
							first_nameLc = value.toLowerCase();
						}
						if(key == "old_first_name"){
							old_first_name = value;
							old_first_nameLc = value.toLowerCase();
						}
						if(key == "last_name"){
							last_name = value;
							last_nameLc = value.toLowerCase();
						}
						if(key == "old_last_name"){
							old_last_name = value;
							old_last_nameLc = value.toLowerCase();
						}
					});

					if((firstname == first_name.toLowerCase() && lastname == "") || (lastname == last_name.toLowerCase() && firstname == "") || (lastname == last_name.toLowerCase() && firstname == first_name.toLowerCase()) || (firstname == old_first_name.toLowerCase() && lastname == "") || (lastname == old_last_name.toLowerCase() && firstname == "") || (lastname == old_last_name.toLowerCase() && firstname == old_first_name.toLowerCase())){
						rows += '<tr data-id="' + personId + '" data-orcid="' + orcid + '"><td><a href="https://ekvv.uni-bielefeld.de/pers_publ/publ/PersonDetail.jsp?personId=' + personId + '" target="_blank">' + personId + '</a></td><td class="name" data-firstname="' + first_name + '" data-lastname="' + last_name + '"><a href="#" class="person_link">' + first_name + " " + last_name + '</a></td></tr>';
						if(old_first_name || old_last_name){
							rows += '<tr data-id="' + personId + '"><td><a href="https://ekvv.uni-bielefeld.de/pers_publ/publ/PersonDetail.jsp?personId=' + personId + '" target="_blank">' + personId + '</a></td><td class="name" data-firstname="' + old_first_name + '" data-lastname="' + old_last_name + '"><a href="#" class="person_link">' + old_first_name + " " + old_last_name + '</a> (now ' + first_name + ' ' + last_name + ')</td></tr>';
						}
					}
					else {
						rows2 += '<tr data-id="' + personId + '"><td><a href="https://ekvv.uni-bielefeld.de/pers_publ/publ/PersonDetail.jsp?personId=' + personId + '" target="_blank">' + personId + '</a></td><td class="name" data-firstname="' + first_name + '" data-lastname="' + last_name + '"><a href="#" class="person_link">' + first_name + " " + last_name + '</a></td></tr>';
						if(old_first_name || old_last_name){
							rows2 += '<tr data-id="' + personId + '"><td><a href="https://ekvv.uni-bielefeld.de/pers_publ/publ/PersonDetail.jsp?personId=' + personId + '" target="_blank">' + personId + '</a></td><td class="name" data-firstname="' + old_first_name + '" data-lastname="' + old_last_name + '"><a href="#" class="person_link">' + old_first_name + " " + old_last_name + '</a> (now ' + first_name + ' ' + last_name + ')</td></tr>';
						}
					}

				}

				if(rows == ""){
					table = "<p>Several possible matches for <em>" + firstname + " " + lastname + "</em> were found in the staff directory (PEVZ). Click on the number (Person ID) to view the person\'s profile in the PEVZ. Click on the name to link the publication to the publication list of this person and make it visible on his/her personal publication page.</p>";
				}
				else{
					table += rows + "</table>";
				}

				if(rows2 == ""){
					table2 = "";
				}
				else {
					table2 += rows2 + "</table>";
				}

				container_title.append(title);
				container.append(table);
				container.append(table2);

				$('.person_link').bind("click", function() {
					var personId = $(this).parent().parent().attr('data-id');
					var orcid = $(this).parent().parent().attr('data-orcid');
					var first_name = $(this).parent().parent().find('.name').attr('data-firstname');
					var last_name = $(this).parent().parent().find('.name').attr('data-lastname');

					var lineId = $(this).parents('.table').attr('id').replace('lineId','');

					$('#' + type + 'first_name_' + lineId).val("");
					$('#' + type + 'first_name_' + lineId).val(first_name);
					$('#' + type + 'last_name_' + lineId).val("");
					$('#' + type + 'last_name_' + lineId).val(last_name);
					$('#' + type + 'first_name_' + lineId + ', #' + type + 'last_name_' + lineId).attr("readonly","readonly");
					$('#' + type + 'Authorized' + lineId).attr('src','/images/biAuthorized.png');
					$('#' + type + 'Authorized' + lineId).attr('alt','Authorized');
					$('#' + type + 'first_name_' + lineId + ', #' + type + 'last_name_' + lineId).parent().removeClass("has-error");

					$('#' + type + 'id_' + lineId).val(personId);
					$('#' + type + 'orcid_' + lineId).val(orcid);

					$('#' + type + 'link_person_modal').modal("hide");
					$('#' + type + 'link_person_modal').find('.modal-body').first().html('');
				});

				$('#' + type + 'link_person_modal').modal("show");
			}

			// No results found
			else {
				var container_title = $('#' + type + 'link_person_modal').find('.modal-title').first();
				var title = '<span class="text-danger"></span> No UniBi author found';
				var container = $('#' + type + 'link_person_modal').find('.modal-body').first();
				container.html('');
				container_title.html('');
				container.append('<p class="has-error">No matching entry in staff directory (PEVZ) found. Please check, if first and last name of the author are entered correctly. You can omit letters (e.g. just enter the last name, or the last name and first letter of first name).</p>');
				container_title.append(title);
				$('#' + type + 'link_person_modal').modal("show");
			}
		}, "json");
	}
	else {
		var orig_first_name = "";
		orig_first_name = $('#' + type + 'orig_first_name_' + lineId).val();
		var orig_last_name = "";
		orig_last_name = $('#' + type + 'orig_last_name_' + lineId).val();

		if($('#' + type + 'Authorized' + lineId).attr('alt') == "Authorized"){
			// Uncheck, release input fields and change img back to gray
			$('#' + type + 'Authorized' + lineId).attr('src','/images/biNotAuthorized.png');
			$('#' + type + 'Authorized' + lineId).attr('alt','Not Authorized');
			$('#' + type + 'id_' + lineId).val("");
			$('#' + type + 'first_name_' + lineId + ', #' + type + 'last_name_' + lineId).removeAttr("readonly");
		}

		$('#' + type + 'first_name_' + lineId).val(orig_first_name);
		$('#' + type + 'orig_first_name_' + lineId).val("");
		$('#' + type + 'last_name_' + lineId).val(orig_last_name);
		$('#' + type + 'orig_last_name_' + lineId).val("");
	}
}


/**
 * Section File Upload
 */

/**
 * Edit uploaded files
 *
 * @param fileId = file ID
 * @param id = record ID
 */
function edit_file(fileId, id){
	var json = jQuery.parseJSON($('#file_' + fileId).val());
	if(json.file_id){
		$('#id_file_id').val(json.file_id);
	}
	if(json.tempid){
		$('#id_temp_id').val(json.tempid);
	}
	$('#id_record_id').val(id);
	$('#id_fileName').val(json.file_name);
	$('#id_creator').val(json.creator);

	if(json.title){
		$('#id_fileTitle').val(json.title);
	}
	if(json.description){
		$('#id_fileDescription').val(json.description);
	}

	if(json.relation != "main_file"){
		$('#id_select_relation option[value="' + json.relation + '"]').prop('selected', true);
	}
	else {
		$('#id_select_relation option[value="main_file"]').prop('selected', true);
	}

	if(json.access_level == "open_access"){
		$('#id_accessLevel_openAccess').prop('checked',true);
		$('#id_accessEmbargo').prop('disabled',true);
	}
	else if(json.access_level == "local"){
		$('#id_accessLevel_local').prop('checked',true);
		$('#id_accessEmbargo').prop('disabled',false);
	}
	else if(json.access_level == "closed"){
		if(json.request_a_copy == "1"){
			$('#id_accessLevel_request').prop('checked',true);
		}
		else {
			$('#id_accessLevel_admin').prop('checked',true);
		}
	    $('#id_accessEmbargo').prop('disabled',false);
	}

	if(json.embargo && json.embargo != ""){
	    $('#id_accessEmbargo').prop('checked',true);
	    $('#id_embargo').prop('disabled', false);
	    $('#id_embargo').val(json.embargo);
	}

	var fileNameTag = self.document.getElementById('fileNameTag');
	fileNameTag.style.display = "block";
	$('#upload_file').modal('show');
}


/**
 * Delete uploaded files
 *
 * @param fileId = file ID
 * @param id = record ID
 * @param fileName = file name
 */
function delete_file(fileId){
	if (confirm("Are you sure you want to delete this uploaded document? Any external links will be broken!\nIf you need to update an existing file to a new version you should edit the corresponding entry in the list and re-upload the file.\n\nDelete this file?")) {
		$('#' + fileId).remove();
	    $('#file_order_' + fileId).remove();
	    if($('#uploadFiles').children('.dz-file-preview').length == 0){
	    	$('#ddc').find('div.mandatory').removeClass('mandatory');
	    	$('#ddc').find('select.required').removeClass('required');
	    }
	}
	return false;
}

/**
 * Makes uploaded file items sortable
 */
$(function () {
	$(".dropzone").sortable({
		containerSelector: 'div.dz-preview',
	    itemSelector: 'div.dz-preview',
	    update: function (event, ui) {
	    	var id = ui.item.attr('id');
	    	$('#sortFilesInput input[value="' + id + '"]').remove();
	    	if(ui.item.index() == 1){
	    		$('#sortFilesInput').prepend('<input type="hidden" name="file_order" id="file_order_' + id + '" value="' + id + '"/>');
	    	}
	    	else {
	    		var itemindex = ui.item.index() - 1;
	    		$('#sortFilesInput input:nth-child(' + itemindex + ')').after('<input type="hidden" name="file_order" id="file_order_' + id + '" value="' + id + '"/>');
	    	}
	    	ui.item.removeClass("dragged").removeAttr("style");
	    	$("body").removeClass("dragging");
	    }
	});

	$(".creator").sortable({
		containerSelector: 'div.row.multirow',
	    itemSelector: 'div.sortitem',
	    update: function (event, ui) {
		    $('.creator').find('div.row.multirow').each(function(index){
		    	var myitem = $(this);
		    	myitem.find('input[name]').each(function(){
		    		var myRegexp = /(.*\.)\d{1,}(\..*)/g;
		    		var myString = $(this).attr('name');
		    		var match = myRegexp.exec(myString);
		    		$(this).attr('name', match[1] + index + match[2]);
		    	});
		    });
	    	ui.item.removeClass("dragged").removeAttr("style");
	    	$("body").removeClass("dragging");
	    }
	});
});

function add_field(name, placeholder){
	var items = $('#' + name + ' div.row.multirow');
	var index = items.index($('#' + name + ' div.row.multirow').last()) + 1;
	var blueprint = $(items[0]).clone();
	//var corrected_index = index;
	//while(corrected_index > 99){
	//	corrected_index = corrected_index - 100;
	//}
	//var label_index = index/100;
	//label_index = Math.floor(label_index);

	$(blueprint).find('input, textarea, img, button, select, span').each(function(){
		if($(this).attr('id')){
			var newid = $(this).attr('id').replace(/0/g,index);
			$(this).attr('id', newid);
		}

		if($(this).attr('name')){
			var newname = $(this).attr('name').replace(/0/g,index);
			//var newname = $(this).attr('name').replace(/0/g,corrected_index);
			//if(label_index && label_index > 0){
			//	newname = $(this).attr('name').replace(/^(\w{1,})/g,'$1_' + label_index);
			//}
			$(this).attr('name', newname);
		}
		$(this).attr('disabled',false);
		$(this).attr('readonly',false);
		$(this).removeClass('has-error');
		$(this).removeAttr('autocomplete');
		$(this).removeAttr('onfocus');

		if(placeholder){
			$(this).attr('placeholder', placeholder);
		}
		if ($(this).prop('tagName') != "BUTTON"){
			$(this).val('');
		}
		if($(this).prop('tagName') == "IMG"){
			$(this).attr('src','/images/biNotAuthorized.png');
			$(this).attr('alt', 'Not Authorized');
			$(this).tooltip();
		}
	});
	$(blueprint).find('#revert_' + index).tooltip();

	$('#' + name).append(blueprint);
	var abbrev;
	switch(name) {
	case "department":
		enable_autocomplete("dp", index)
			break;
	case "affiliation":
		enable_autocomplete("aff", index)
		break;
	case "data_manager":
		enable_autocomplete("dm", index)
		break;
	case "reviewer":
		enable_autocomplete("rv", index)
		break;
	case "person_affiliation":
		enable_autocomplete("person_aff", index)
		break;
	case "project":
		enable_autocomplete("pj", index)
		break;
	case "research_group":
		enable_autocomplete("rg", index)
		break;
    }

}

function remove_field(object){
	var container = $(object).closest('div.multirow');
	var index = $(container).index();

	if(parseInt(index) > 0){
	  var all_containers = $(container).parent().children('div.multirow');
	  $(container).remove();
	  var cont = $(all_containers).slice(index + 1);
	  $(cont).each(function(cindex){
		  var newindex = parseInt(cindex) + parseInt(index);
		  var current_container = $(this);
		  $(current_container).find('input, textarea, img, select, span').each(function(){
			  if($(this).attr('id')){
				  var newid = $(this).attr('id').replace(/\d+/g,newindex);
				  $(this).attr('id', newid);
			  }

			  if($(this).attr('name')){
				  var newname = $(this).attr('name').replace(/\d+/g,newindex);
				  $(this).attr('name', newname);
			  }

			  if($(this).attr('onfocus')){
				  var newattr = $(this).attr('onfocus').replace(/\d+/g,newindex);
				  $(this).attr('onfocus', newattr);
			  }
		  });
	  });
	}
	else if(parseInt(index) == 0){
		$(container).find('input, textarea, img, select').each(function(){
			$(this).val('');
			$(this).attr('disabled',false);
			$(this).attr('readonly',false);
			$(this).removeAttr('autocomplete');
			if($(this).prop('tagName') == "IMG"){
				$(this).attr('src','/images/biNotAuthorized.png');
				$(this).attr('alt', 'Not Authorized');
			}
		});
	}
}

function full_remove_field(object){
	var container = $(object).closest('div.multirow');
	var index = $(container).index();

	  var all_containers = $(container).parent().children('div.multirow');
	  $(container).remove();
	  var cont = $(all_containers).slice(index + 1);
	  $(cont).each(function(cindex){
		  var newindex = parseInt(cindex) + parseInt(index);
		  var current_container = $(this);
		  $(current_container).find('input, textarea, img, select, span').each(function(){
			  if($(this).attr('id')){
				  var newid = $(this).attr('id').replace(/\d+/g,newindex);
				  $(this).attr('id', newid);
			  }

			  if($(this).attr('name')){
				  var newname = $(this).attr('name').replace(/\d+/g,newindex);
				  $(this).attr('name', newname);
			  }

			  if($(this).attr('onfocus')){
				  var newattr = $(this).attr('onfocus').replace(/\d+/g,newindex);
				  $(this).attr('onfocus', newattr);
			  }
		  });
	  });
}

function enable_autocomplete(field, index){
	var type;
	switch(field) {
	case "pj":
		type = "project"
		break;
	case "rg":
		type = "research_group"
		break;
	case "person_aff":
		type = "department"
		break;
	default:
		type = "department"
	}
	$( "#" + field + "_autocomplete_" + index ).autocomplete({
		source: "/get_" + type,
		minLength: 0,
	    response: function( event, ui ) {
            if (ui.content.length === 0) {
                $("#" + field + "_autocomplete_" + index).focus();
            }
        },
        messages: {
	        noResults: '',
	        results: function() {}
	    },
		select: function( event, ui ) {
			$( "#" + field + "_autocomplete_" + index ).val( ui.item.label );
            $( "#" + field + "_nameautocomplete_" + index ).val( ui.item.label );
            $( "#" + field + "_idautocomplete_" + index ).val( ui.item.id );
            $( "#" + field + "_autocomplete_" + index ).attr("disabled", "disabled");
            $('input.sticky').blur();
        },
	    close: function(){
	    	$('input.sticky').blur();
	    	if(field == "person_aff"){
	    		$('#id_save_aff').submit();
	    	}
	    },
	});
}


$(function(){
	$('div.input-group.sticky .input-group-addon:first-child').on("click", function(){
		$(this).parent('div.input-group.sticky').children('input, select').focus();
	});
	$('input.sticky, select.sticky, textarea.sticky').on("focus",function(){
		var input_group = $(this).parent('div.sticky');
		var first_addon = input_group.children('div.input-group-addon:first-child');
		if(input_group.parent('.form-group').hasClass('hidden-lg') || input_group.parent('.form-group').hasClass('hidden-md')){
			if(first_addon && $(this).prop('tagName') != 'SELECT'){
				first_addon.css("display","none");
				$(this).css("border-bottom-left-radius","3px");
				$(this).css("border-top-left-radius","3px");
			}
		}

		$(this).css("border","none");
		var addon = $(this).parent('div.input-group.sticky').children('div.input-group-addon');

		if($(this).parent('div.sticky').hasClass('mandatory')){
			$(this).parent('div.sticky').css("-webkit-box-shadow", "inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 6px #d3d3d3");
			$(this).parent('div.sticky').css("box-shadow", "inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 6px #d3d3d3");
			$(this).parent('div.sticky').css("border", "1px solid #666");
			$(this).css("box-shadow", "inset 0 1px 1px -1px rgba(0, 0, 0, 0.075), 0 0 6px -6px #d3d3d3");
		}
		else {
			$(this).parent('div.sticky').css("-webkit-box-shadow", "inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(102, 175, 233, 0.6)");
			$(this).parent('div.sticky').css("box-shadow","inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(102, 175, 233, 0.6)");
			$(this).parent('div.sticky').css("border", "1px solid #66afe9");
			$(this).css("box-shadow", "inset 0 1px 1px -1px rgba(0, 0, 0, 0.075), 0 0 8px -8px rgba(102, 175, 233, 0.6)");
		}

		if($(this).attr('id')){
			var mymatch = $(this).attr('id').match(/dp_autocomplete_(\d{1,})/);
			if(mymatch && mymatch[1]){
				var index = mymatch[1];
				enable_autocomplete("dp", index);
			}
			mymatch = $(this).attr('id').match(/pj_autocomplete_(\d{1,})/);
			if(mymatch && mymatch[1]){
				var index = mymatch[1];
				enable_autocomplete("pj", index);
			}
		}
	});

	$('input.sticky, select.sticky, textarea.sticky').on("blur", function(){
		var addon = $(this).parent('div.input-group.sticky').children('div.input-group-addon');
		addon.css("border","none");
		if($(this).parent('div.sticky').hasClass('mandatory')){
			$(this).parent('div.sticky').css("border", "1px solid #666");
		}
		else{
			$(this).parent('div.sticky').css("border", "1px solid #cccccc");
		}
		$(this).parent('div.sticky').css("-webkit-box-shadow","inset 0 1px 1px rgba(0, 0, 0, 0.075)");
        $(this).parent('div.sticky').css("box-shadow","inset 0 1px 1px rgba(0, 0, 0, 0.075)");
        $(this).parent('div.sticky').css("-webkit-box-shadow", "none");
        $(this).parent('div.sticky').css("box-shadow","none");
        $(this).parent('div.sticky').css("border-radius","3px");

		var first_addon = $(this).parent('div.input-group.sticky').children('div.input-group-addon:first-child');
		first_addon.css("display", "table-cell");
	});
});
