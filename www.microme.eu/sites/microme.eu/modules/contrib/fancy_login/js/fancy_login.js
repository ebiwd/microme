/*globals Drupal, jQuery, window*/
/*jslint plusplus: true, sloppy: true, white: true */

(function($, Drupal, window)
{
	var la = false, popupVisible, ctrlPressed, fancyLoginBox, messageContainer;

	popupVisible = false;
	ctrlPressed = false;

	function moveMessages()
	{
		var messages = $("#fancy_login_login_box .messages");

		if(messages.length)
		{
			if(!messageContainer)
			{
				messageContainer = $("<div/>").attr("id", "fancy_login_messages_container_wrapper").prependTo("body");
			}
			messages.each(function()
			{
				$(this).appendTo(
					$("<div/>").attr("class", "fancy_login_messages_container").appendTo(messageContainer)
				).before(
					$("<div/>").attr("class", "fancy_login_message_close_button").text("X")
				);
			});
		}
	}

	function showLogin()
	{
		var settings = Drupal.settings.fancyLogin;

		if(!popupVisible)
		{
			popupVisible = true;
			if(settings.hideObjects)
			{
				$("object, embed").css("visibility", "hidden");
			}
			$("#fancy_login_dim_screen").css({backgroundColor: settings.screenFadeColor, zIndex:settings.screenFadeZIndex, opacity:0, display:"block"}).fadeTo(settings.dimFadeSpeed, 0.8, function()
			{
				var eHeight, eWidth, eTopMargin, eLeftMargin;

				eHeight = fancyLoginBox.height();
				eWidth = fancyLoginBox.width();
				eTopMargin = - 1 * (eHeight / 2);
				eLeftMargin = -1 * (eWidth / 2);

				fancyLoginBox.css({marginLeft:eLeftMargin, marginTop:eTopMargin, color:settings.loginBoxTextColor, backgroundColor:settings.loginBoxBackgroundColor, borderStyle:settings.loginBoxBorderStyle, borderColor:settings.loginBoxBorderColor, borderWidth:settings.loginBoxBorderWidth, zIndex:(settings.screenFadeZIndex + 1)}).fadeIn(settings.boxFadeSpeed).find(".form-text:first").focus().select();
			});
		}
	}

	function hideLogin()
	{
		var settings = Drupal.settings.fancyLogin;

		if(popupVisible)
		{
			popupVisible = false;
			$("#fancy_login_login_box").fadeOut(settings.boxFadeSpeed, function()
			{
				$("#fancy_login_dim_screen").fadeOut(settings.dimFadeSpeed, function()
				{
					if(settings.hideObjects)
					{
						$("object, embed").css("visibility", "visible");
					}
				});
				$(window).focus();
			});
		}
	}

	function popupCloseListener()
	{
		$("#fancy_login_dim_screen:not(.fancy-login-close-listener-processed), #fancy_login_close_button:not(.fancy-login-close-listener-processed)").each(function()
		{
			$(this).addClass("fancy-login-close-listener-processed").click(function(e)
			{
				e.preventDefault();

				hideLogin();
			});
		});
	}

	function statusMessageCloseListener()
	{
		$(".fancy_login_message_close_button:not(.status-message-close-listener-processed)").each(function()
		{
			$(this).addClass("status-message-close-listener-processed").click(function()
			{
				$(this).parent().fadeOut(250, function()
				{
					$(this).remove();
				});
			});
		});
	}

	function loginLinkListener()
	{
		var settings = Drupal.settings.fancyLogin;

		$("a[href*='" + settings.loginPath + "']:not(.login-link-listener-processed):not(.fancy_login_disable), .fancy_login_show_popup:not(.login-link-listener-processed):not(.fancy_login_disable)").each(function()
		{
			$(this).addClass("login-link-listener-processed").click(function(e)
			{
				e.preventDefault();

				showLogin();
			});
		});
	}

	function init()
	{
		$("body:not(.fancy-login-init-processed)").each(function()
		{
			$(this).addClass("fancy-login-init-processed");
			fancyLoginBox = $("#fancy_login_login_box");
			$(window.document).keyup(function(e)
			{
				if(e.keyCode === 17)
				{
					ctrlPressed = false;
				}
			    else if(e.keyCode === 27)
			    {
			        hideLogin();
			    }
			});
			$(window.document).keydown(function(e)
			{
				if(e.keyCode === 17)
				{
					ctrlPressed = true;
				}
				if(ctrlPressed === true && e.keyCode === 190)
				{
					ctrlPressed = false;

					if(popupVisible)
					{
						hideLogin();
					}
					else
					{
						showLogin();
					}
				}
			});
		});
	}

	function popupTextfieldListener()
	{
		fancyLoginBox.find(".form-text:not(.fancy-login-popup-textfield-listener-processed)").each(function()
		{
			$(this).addClass("fancy-login-popup-textfield-listener-processed").keydown(function (event)
			{
				if(event.keyCode === 13)
				{
					$(this).parent().siblings(".form-actions:first").children(".form-submit:first").mousedown();
				}
			});
		});
	}

	function loadForm(type)
	{
		var formLoadDimmer = $("<div/>").attr("id", "form_load_dimmer").css({opacity:0, display:"block"}).appendTo(fancyLoginBox).fadeTo(250, 0.8);

		$.ajax(
		{
			url:Drupal.settings.basePath + "fancy_login/ajax/" + type,
			dataType:"json",
			success:function(data)
			{
				var wrapper, oldContents, newContents, oldHeight, newHeight, newMargin;

				wrapper = fancyLoginBox.find("#fancy_login_user_login_block_wrapper:first");
				oldContents = wrapper.contents().clone(true);
				oldHeight = wrapper.height();
				newContents =$("<div/>").html(data.content).contents();
				wrapper.empty();
				wrapper.append(newContents);
				newHeight = wrapper.height();
				newMargin = fancyLoginBox.outerHeight() / -2;
				wrapper.empty();
				wrapper.append(oldContents);
				wrapper.css("height", oldHeight);
				oldContents.fadeOut(250, function()
				{
					$(this).remove();
					fancyLoginBox.animate(
					{
						marginTop:newMargin
					},
					{
						duration:250
					});
					wrapper.animate(
					{
						height:newHeight
					},
					{
						duration:250,
						complete:function()
						{
							newContents.appendTo(wrapper).fadeIn(250, function()
							{
								wrapper.css("height", "auto");
								formLoadDimmer.fadeOut(250, function()
								{
									$(this).remove();
								});
							});
							Drupal.attachBehaviors();
						}
					});
				});
			}
		});
	}

	function linkListeners()
	{
		var anchors = fancyLoginBox.find("a");

		if(!Drupal.settings.fancyLogin.disableRegistration)
		{
			anchors.filter("[href*='user/register']:not(.fancy-login-register-link-processed)").each(function()
			{
				$(this).addClass("fancy-login-register-link-processed").click(function(e)
				{
					e.preventDefault();
					loadForm("register");
				});
			});
		}

		anchors.filter("[href*='user/password']:not(.fancy-login-password-link-processed)").each(function()
		{
			$(this).addClass("fancy-login-password-link-processed").click(function(e)
			{
				e.preventDefault();
				loadForm("password");
			});
		});

		anchors.filter("[href*='user/login']:not(.fancy-login-login-link-processed)").each(function()
		{
			$(this).addClass("fancy-login-login-link-processed").click(function(e)
			{
				e.preventDefault();
				loadForm("login");
			});
		});
	}

	Drupal.behaviors.fancyLogin = function()
	{
		if(!$.browser.msie || $.browser.version > 6 || window.XMLHttpRequest)
		{
			init();
			loginLinkListener();
			popupTextfieldListener();
			popupCloseListener();
			moveMessages();
			statusMessageCloseListener();
			linkListeners();
		}
	};

	$(document).ajaxComplete(function(e, xhr, settings)
	{
		if(settings.url.match(/^\/fancy_login\/ahah\/.*/))
		{
			var closePopup, refreshPage, redirectPage, redirectURL;

			closePopup = $("#fancy_login_close_popup");
			if(closePopup.length)
			{
				closePopup.remove();
				hideLogin();
			}

			refreshPage = $("#fancy_login_refresh_page");
			if(refreshPage.length)
			{
				refreshPage.remove();
				window.location.reload();
			}

			redirectPage = $("#fancy_login_redirect_page");
			if(redirectPage.length)
			{
				redirectURL = redirectPage.text();
				redirectPage.remove();
				window.location = redirectURL;
			}
		}
	});
}(jQuery, Drupal, window));
