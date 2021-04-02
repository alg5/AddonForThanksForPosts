﻿﻿(function ($, document) { // Avoid conflicts with other libraries
	var thanks_icon_add = 'fa-thumbs-o-up',
		thanks_icon_remove = 'fa-thumbs-o-down',
		thanks_icons = '.fa-thumbs-o-up,.fa-thumbs-o-down';

	function add_ajax_thanks(e, elements) {
		var btnsLike =$('i.icon').filter(function (index, item) {
		return $(this).is(thanks_icons);
		});
		let lnk_thanks_posts = document.querySelectorAll('*[id^="lnk_thanks_post"]');
		// $(btnsLike).on('click', function (e) {
		 $(lnk_thanks_posts).on('click', function (e) {
			e.preventDefault();
			 if ($(this).hasClass("disabled")) {
				return false;
			}
			//set all thanks button disabled
			// $(btnsLike).addClass("disabled");
			 $(lnk_thanks_posts).addClass("disabled");
			var action = $(this).find('i').hasClass(thanks_icon_add) ? 'thanks' : 'rthanks';
			var post_block = $(this).parents('div.post');
			var post_id;
			if ($(post_block).attr("id") == 'post-article') {
				post_id = $(post_block).prev().attr('id').replace(/p/g, '');
			} else {
				post_id = $(post_block).attr('id').replace(/p/g, '');
			}
			var url = $('#lnk_thanks_post' + post_id).attr('href');
			var poster_id = $.urlParam('to_id', url);
			// console.log('url = ' + url);
			// console.log('poster_id = ' + poster_id);
			// console.log('U_ADDONFORTHANKSFORPOSTS_PATH = ' + U_ADDONFORTHANKSFORPOSTS_PATH);
			//patch remove sid
			U_ADDONFORTHANKSFORPOSTS_PATH = U_ADDONFORTHANKSFORPOSTS_PATH.split("/?sid")[0];
			var path = U_ADDONFORTHANKSFORPOSTS_PATH + action + '/' + poster_id + '/' + forum_id + '/' + topic_id + '/' + post_id;
			console.log("path = " + path);
			$.ajax({
				type: 'POST',
				dataType: 'json',
				cache: false,
				url: path,
				success: function (data) {
					togle_thanks(data);
				}
			});
		});

		$("div.postbody").on('click', 'a[id^="clear_list_thanks"]', function (e) {
			e.preventDefault();
			var post_id = $(this).attr('id').replace(/clear_list_thanks/g, '');
			var url = $('#lnk_thanks_post' + post_id).attr('href');
			var poster_id = $.urlParam('to_id', url);//			
			var n = noty({
				text: LA_CLEAR_LIST_THANKS_CONFIRM,
				type: 'notification',
				dismissQueue: false,
				layout: 'topCenter',
				timeout: false, // delay for closing event. Set false for sticky notifications
				modal: true,
				closeWith: ['button'], // ['click', 'button', 'hover']

				theme: 'defaultTheme',
				buttons: [{
						addClass: 'btn btn-primary', text: LA_YES, onClick: function ($noty) {
							var path = U_ADDONFORTHANKSFORPOSTS_PATH + 'clear_thanks/' + poster_id + '/' + $("input[name='forum_id']").val() + '/' + $("input[name='topic_id']").val() + '/' + post_id;
							$.ajax({
								type: 'POST',
								dataType: 'json',
								url: path,
								success: function (data) {
									list_thanks_for_post_cleared(data);
								}
							});
							$noty.close();
						}
					},
					{
						addClass: 'btn btn-danger', text: LA_NO, onClick: function ($noty) {
							$noty.close();
						}
					}]
			});
		});
	}

	$(document).ready(function (e) {
		add_ajax_thanks(e, $(document));
	});
	$('#qr_posts').on('qr_loaded', add_ajax_thanks);

	function togle_thanks(data) {
	var btnsLike =$('i.icon').filter(function (index, item) {
		return $(this).is(thanks_icons);
		});	
		let lnk_thanks_posts = document.querySelectorAll('*[id^="lnk_thanks_post"]');
		// console.log(lnk_thanks_posts);		
		//set all thanks button enabled
		// $(btnsLike).removeClass("disabled");
		$(lnk_thanks_posts).removeClass("disabled");
		if (data['ERROR']) {
			for (i = 0; i < data['ERROR'].length; i++) {
				output_info_new(data['ERROR'][i], 'error');
			}
			return;
		}
		output_info_new(data['SUCCESS'], 'warning');

		//update icon and tooltip
		data.CLASS_ICON = (data.CLASS_ICON == 'fa-thumbs-o-up') ? thanks_icon_add : thanks_icon_remove;

		if (data.IS_ALLOW_REMOVE_THANKS) {

			$("#lnk_thanks_post" + data.POST_ID).attr('title', data.THANK_ALT).attr('href', data.THANK_PATH.replace(/&amp;/g, '&'));
			$("#lnk_thanks_post" + data.POST_ID).find('i').removeClass(thanks_icon_add).removeClass(thanks_icon_remove).addClass(data.CLASS_ICON);

			//patch for quick links
			$(".clone-first a#lnk_thanks_post" + data.POST_ID).attr('title', data.THANK_ALT).attr('href', data.THANK_PATH.replace(/&amp;/g, '&'));
			$(".clone-first a#lnk_thanks_post" + data.POST_ID).find('span').html(data.THANK_ALT_SHORT);
			$(".clone-first a#lnk_thanks_post" + data.POST_ID).find('i').removeClass(thanks_icon_add).removeClass(thanks_icon_remove).addClass(data.CLASS_ICON);
		 }
		 else
		 {
			$("#lnk_thanks_post" + data.POST_ID).parent().hide();	
			//patch for quick links
			$(".clone-first a#lnk_thanks_post" + data.POST_ID).parent().hide();
		 }
		//update reput list
		if (data.THANKS && data.THANKS_POSTLIST_VIEW) {
			var updDiv = "<div class='notice'>";
			updDiv = updDiv + "<dl>";
			if (!data.S_POST_ANONYMOUS && !data.S_IS_BOT && data.S_MOD_THANKS) {
				updDiv = updDiv + "<ul class='post-buttons' style='float:left; position:static;'>";
				updDiv = updDiv + "<li>";
				updDiv = updDiv + "<a id='clear_list_thanks" + data.POST_ID + "' href='#' title='" + LA_CLEAR_LIST_THANKS + "' class='button button-icon-only' style='float:left;'>"
				updDiv = updDiv + "<i class='icon fa-times fa-fw' aria-hidden='true'></i><span class='sr-only'>" + LA_CLEAR_LIST_THANKS + "</span>";
				updDiv = updDiv + "</a>";
				updDiv = updDiv + "</li>";
				updDiv = updDiv + "</ul>";
			}
			if (!data.S_POST_ANONYMOUS && !data.S_IS_BOT) {
				updDiv = updDiv + "<dt>" + data.THANK_TEXT + data.POST_AUTHOR_FULL + data.THANK_TEXT_2 + "</dt>";
				updDiv = updDiv + "<dd>" + data.THANKS + "</dd>";
			}
			updDiv = updDiv + "</dl>";
			updDiv = updDiv + "</div>";

			$('#list_thanks' + data.POST_ID).html(updDiv);
		} else {
			$('#list_thanks' + data.POST_ID).html('');
		}

		//update reput graphic
		if (data.S_THANKS_POST_REPUT_VIEW && data.POST_REPUT && !data.S_POST_ANONYMOUS && !data.S_IS_BOT) {
			var updDiv = '';
			updDiv = updDiv + "<div class='notice'>";
			updDiv = updDiv + "<dl>";
			updDiv = updDiv + "<dt class='small'><strong>" + LA_REPUT + ":</strong>&nbsp;" + data.POST_REPUT + "</dt>";
			updDiv = updDiv + "<dd>";
			if (data.S_THANKS_REPUT_GRAPHIC) {
				updDiv = updDiv + "<span style='display: block; float: left; width: " + data.THANKS_REPUT_GRAPHIC_WIDTH + "; height: " + data.THANKS_REPUT_HEIGHT + "; background-repeat: repeat-x;'>";
				updDiv = updDiv + "<span style='display: block; height:" + data.THANKS_REPUT_HEIGHT + "; width: " + data.POST_REPUT + "; background-repeat: repeat-x;'></span></span>&nbsp";
			}
			updDiv = updDiv + "</dd></dl></div>";
			$('#div_post_reput' + data.POST_ID).html(updDiv);
		} else {
			$('#div_post_reput' + data['POST_ID']).html('');
		}
		//update profile
		update_profile(data)
		
	//update text with [hide]BBCODE
		update_text(data)
	}

	function list_thanks_for_post_cleared(data) {
		data.CLASS_ICON = (data.CLASS_ICON == 'fa-thumbs-o-up') ? thanks_icon_add : thanks_icon_remove;

		if (data['ERROR']) {
			for (i = 0; i < data['ERROR_COUNT']; i++) {
				output_info_new(data['ERROR'][i], 'error');
			}
			return;
		}
		output_info_new(data['SUCCESS'], 'warning');
		//clear list and reput
		$('#div_post_reput' + data['POST_ID']).html('');
		$('#list_thanks' + data['POST_ID']).html('');

		//update thanks img
		$("#lnk_thanks_post" + data.POST_ID).attr('title', data.THANK_ALT).attr('href', data.THANK_PATH.replace(/&amp;/g, '&'));
		$("#lnk_thanks_post" + data.POST_ID).find('i').removeClass(thanks_icon_add).removeClass(thanks_icon_remove).addClass(data.CLASS_ICON);

		//update profile
		update_profile(data)
	}

	function update_profile(data) {
		if (!data.S_POST_ANONYMOUS && data.THANKS_COUNTERS_VIEW) {
			$("dd[data-user-receive-id= " + data['POSTER_ID'] + "]").each(function () {
				var rcv = '';
				if (data.POSTER_RECEIVE_COUNT == 0) {
					$(this).html('');
				} 
		else {
			rcv = "<strong>" + LA_RECEIVED + ":</strong>&nbsp;<a href='" + data.POSTER_RECEIVE_COUNT_LINK + "'>" + data.POSTER_RECEIVE_COUNT + "</a>";
			$(this).html(rcv);
				}
			});

			$("dd[data-user-give-id= " + data['USER_ID'] + "]").each(function () {
				var give = '';
				if (data.POSTER_GIVE_COUNT == 0) {
					$(this).html('');
				} else {
					give = "<strong>" + LA_GIVEN + ":</strong>&nbsp;<a href='" + data.POSTER_GIVE_COUNT_LINK + "'>" + data.POSTER_GIVE_COUNT + "</a>";
					$(this).html(give);
				}
			});
		}
	}
	function update_text(data)
	{
		if (data.IS_CHANGE_TEXT && data.CORRETED_TEXT_BBCODE != '')
		{
			console.log(data);
			var content = $("#p"+ data.POST_ID).find("div.content");
			
			console.log(content);
			$(content).html(data.CORRETED_TEXT_BBCODE);
			
		}
	}
	//creates a new jQuery UI notification message
	function output_info_new(message, type, expire, is_reload) {
		if (type == null)
			type = 'notification';
		if (expire == null)
			expire = 4000;
		var n = noty({
			text: message,
			type: type,
			timeout: expire,
			layout: 'topRight',
			theme: 'defaultTheme',
			callback: {
				afterClose: function () {
					if (is_reload == null || is_reload == '' || is_reload != true)
						return;
					window.location.reload();
				}
			}
		});
	}

	$.urlParam = function (name, url) {
		var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(url);
		if (results == null) {
			return null;
		} else {
			return results[1] || 0;
		}
	}
})(jQuery, document);				// Avoid conflicts with other libraries
