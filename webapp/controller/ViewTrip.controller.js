sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/Device"
], function (Controller, MessageBox, History, JSONModel, MessageToast, Device) {
	"use strict";

	return Controller.extend("project.ZVehicleTrackingDriver.controller.ViewTrip", {

		onInit: function () {

			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this._oRouter.getRoute("ViewTrip").attachPatternMatched(this._onViewTripMatched, this);
		},

		// function for loading google maps
		loadGoogleMaps: function ( scriptUrl, callbackFn) {
			var script = document.createElement('script');
			script.onload = function () {
					callbackFn();
				}
						script.src = scriptUrl;  

		//	script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDIMcYSx3_jQfjEQv5JwOq-SSgoIG7x_9E&avoid=TOLLS&libraries=places&callback=initMap';

			document.body.appendChild(script);
		},

		setMapData: function () {

			var oModelTrip = this.getOwnerComponent().getModel("TripSet");
			this.getView().setModel(oModelTrip);

			var oModel = this.getView().getModel();
			var myRouteLatFrom, myRouteLngFrom, myRouteLatTo, myRouteLngTo, RouteFrom, RouteTo = "";
			var TripId = this.getView().byId("txtTripId");

			for (var i = 0; i < oModel.getData().Trips.length; i++) {
				if (oModel.getData().Trips[i].TripId.toString() === TripId.getText()) {
					myRouteLatFrom = parseFloat(oModel.getData().Trips[i].RouteLatFrom);
					myRouteLngFrom = parseFloat(oModel.getData().Trips[i].RouteLngFrom);
					myRouteLatTo = parseFloat(oModel.getData().Trips[i].RouteLatTo);
					myRouteLngTo = parseFloat(oModel.getData().Trips[i].RouteLngTo);
					RouteFrom = oModel.getData().Trips[i].VehicleRouteFrom;
					RouteTo = oModel.getData().Trips[i].VehicleRouteTo;
				}
			}

			var pointA = new google.maps.LatLng(myRouteLatFrom, myRouteLngFrom);
			var pointB = new google.maps.LatLng(myRouteLatTo, myRouteLngTo);
			var StartPointName = RouteFrom;
			var EndPointName = RouteTo;

			var myOptions = {
				center: pointA,
				zoom: 5,
				scrollwheel: true,
				draggable: true,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};

			var map = new google.maps.Map(this.getView().byId("googleMap").getDomRef(), myOptions);

			var directionsDisplay = new google.maps.DirectionsRenderer({
				map: map,
				suppressMarkers: true
			});
			var directionsService = new google.maps.DirectionsService();
			var infowindow = new google.maps.InfoWindow();
			var marker1, marker2;
			var image = "../model/car.jpg";
			marker1 = new google.maps.Marker({
				position: pointA,
				map: map,
				icon: image
			});
			marker2 = new google.maps.Marker({
				position: pointB,
				map: map,
				icon: image
			});

			var that = this;
			that._calculateAndDisplayRoute(directionsService, directionsDisplay, pointA, pointB);

			google.maps.event.addListener(marker1, 'click', (function (marker, i) {
				return function () {
					infowindow.setContent(StartPointName);
					infowindow.open(map, marker);
				}
			})(marker1, i));

			google.maps.event.addListener(marker2, 'click', (function (marker, i) {
				return function () {
					infowindow.setContent(EndPointName);
					infowindow.open(map, marker);
				}
			})(marker2, i));

		},

		_calculateAndDisplayRoute: function (directionsService, directionsDisplay, pointA, pointB) {
			var txtDistance = this.getView().byId("txtDistance");
			var txtDuration = this.getView().byId("txtDuration");
			directionsService.route({
				origin: pointA,
				destination: pointB,
				optimizeWaypoints: true,
				travelMode: google.maps.TravelMode.DRIVING
			}, function (response, status) {
				if (status == google.maps.DirectionsStatus.OK) {
					directionsDisplay.setDirections(response);
					txtDistance.setText(response.routes[0].legs[0].distance.text);
					txtDuration.setText(response.routes[0].legs[0].duration.text);
				} else {
					MessageBox.error("No Directions Found");
				}
			});
		},
		_LoadGeoLocation: function () {

			var myLatitude = this.getView().byId("txtLat");
			var myLongitude = this.getView().byId("txtLng");

			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(function (position) {
					myLatitude.setText(position.coords.latitude);
					myLongitude.setText(position.coords.longitude);
				});
			} else {
				MessageBox.error("Error in location");
			}

		},

		_onViewTripMatched: function (oEvent) {

			var that = this;

			that._LoadGeoLocation();

			var oParameters = oEvent.getParameters();
			var oModelTrip = this.getOwnerComponent().getModel("TripSet");
			this.getView().setModel(oModelTrip);
			var oModel = this.getView().getModel();

			var txtTripId = this.getView().byId("txtTripId");
			var txtVechileRegNo = this.getView().byId("txtVechileRegNo");
			var txtDriverName = this.getView().byId("txtDriverName");
			var txtRoute = this.getView().byId("txtRoute");
			var txtDate = this.getView().byId("txtDate");
			var txtStartTime = this.getView().byId("txtStartTime");
			var txtEndTime = this.getView().byId("txtEndTime");
			var txtStatus = this.getView().byId("txtStatus");
			var txtComments = this.getView().byId("txtComments");
			var btnStartTrip = this.getView().byId("btnStartTrip");
			var btnEndTrip = this.getView().byId("btnEndTrip");
			var lblTime = this.getView().byId("lblTime");

			if (oParameters.arguments.TripId !== "" || oParameters.arguments.TripId !== null) {
				this.TripId = oParameters.arguments.TripId;
				for (var i = 0; i < oModel.getData().Trips.length; i++) {
					if (oModel.getData().Trips[i].TripId.toString() === this.TripId) {
						txtTripId.setText(this.TripId);
						txtVechileRegNo.setText(oModel.getData().Trips[i].RegistrationNo);
						txtDriverName.setText(oModel.getData().Trips[i].DriverName);
						txtRoute.setText(oModel.getData().Trips[i].VehicleRouteFrom + " - " + oModel.getData().Trips[i].VehicleRouteTo);
						txtDate.setText(oModel.getData().Trips[i].AssignedDateFrom);
						txtStartTime.setText(oModel.getData().Trips[i].AssignedTimeFrom);
						txtEndTime.setText(oModel.getData().Trips[i].AssignedTimeTo);
						txtStatus.setText(oModel.getData().Trips[i].Status);
						txtStatus.setType(oModel.getData().Trips[i].Type);
						txtComments.setText(oModel.getData().Trips[i].Comments);

						if (oModel.getData().Trips[i].Status === "COMPLETED" || oModel.getData().Trips[i].Status === "CANCELLED") {
							btnStartTrip.setVisible(false);
							btnEndTrip.setVisible(false);
							lblTime.setText("");
							lblTime.setVisible(false);
						} else if (oModel.getData().Trips[i].Status === "ONGOING") {
							btnStartTrip.setVisible(false);
							btnEndTrip.setVisible(true);
							setInterval(function () {
								var result = that.GetClock();
								lblTime.setText("Time : " + result);
							}, 1000);
							lblTime.setVisible(true);
						} else if (oModel.getData().Trips[i].Status === "UPCOMING") {
							btnStartTrip.setVisible(true);
							btnEndTrip.setVisible(false);
							lblTime.setText("");
							lblTime.setVisible(false);
						}
						that.setMapData();
						return false;
					}
				}

			} else {
				MessageBox.error("Incorrect Data");
			}
		},

		_getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		_onNavBack: function () {
			this._getRouter().navTo("TripManager", {}, true);
		},
		_onPressMenu: function (oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			if (oEvent.getSource().getText() === "Dashboard") {
				oRouter.navTo("Dashboard");
			} else if (oEvent.getSource().getText() === "Trip Manager") {
				oRouter.navTo("TripManager");
			}
		},

		GetClock: function () {
			var result = "";
			var txtStatus = this.getView().byId("txtStatus");
			if (txtStatus.getText() === "ONGOING" || txtStatus.getText() === "UPCOMING") {
				/*var tday = new Array("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday");
			var tmonth = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November",
				"December");*/
				var d = new Date();
				/*var nday = d.getDay(),
					nmonth = d.getMonth(),
					ndate = d.getDate(),
					nyear = d.getYear();*/
				var nhour = d.getHours(),
					nmin = d.getMinutes(),
					nsec = d.getSeconds(),
					ap;
				if (nhour === 0) {
					ap = " AM";
					nhour = 12;
				} else if (nhour < 12) {
					ap = " AM";
				} else if (nhour === 12) {
					ap = " PM";
				} else if (nhour > 12) {
					ap = " PM";
					nhour -= 12;
				}
				/*if (nyear < 1000) {
					nyear += 1900;
				}*/
				if (nmin <= 9) {
					nmin = "0" + nmin;
				}
				if (nsec <= 9) {
					nsec = "0" + nsec;
				}
				result = nhour + ":" + nmin + ap;
				return result;

			} else {
				result = "";
				return result;
			}

		},

		onGeoSuccess: function (position) {
			//var txtLat = this.getView().byId("txtLat");
			//var txtLng = this.getView().byId("txtLng");
			var txtLat = position.coords.latitude;
			var txtLng = position.coords.longitude;
			var latlongvalue = position.coords.latitude + "," + position.coords.longitude;

		},
		onGeoError: function (error) {
			MessageBox.success('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
		},

		_GetCuurentDate: function (CurrDate) {
			var currentDate = new Date()
			var day = currentDate.getDate();
			var month = currentDate.getMonth() + 1;
			var year = currentDate.getFullYear();
			if (day < 10) {
				day = "0" + parseInt(currentDate.getDate());
			}
			if (month < 10) {
				month = "0" + parseInt(currentDate.getMonth() + 1);
			}

			CurrDate = day + "/" + month + "/" + year
			return CurrDate;
		},

		_convertTo24hrFormat: function (time) {
			var hours = Number(time.match(/^(\d+)/)[1]);
			var minutes = Number(time.match(/:(\d+)/)[1]);
			var AMPM = time.match(/\s(.*)$/)[1];
			if (AMPM == "PM" && hours < 12) hours = hours + 12;
			if (AMPM == "AM" && hours == 12) hours = hours - 12;
			var sHours = hours.toString();
			var sMinutes = minutes.toString();
			if (hours < 10) sHours = "0" + sHours;
			if (minutes < 10) sMinutes = "0" + sMinutes;
			time = sHours + ":" + sMinutes;
			return time;
		},

		_StartTrip: function () {
			var that = this;

			var myLatitude = this.getView().byId("txtLat");
			var myLongitude = this.getView().byId("txtLng");

			var btnStartTrip = this.getView().byId("btnStartTrip");
			var btnEndTrip = this.getView().byId("btnEndTrip");
			var txtTripId = this.getView().byId("txtTripId");
			var txtStartTime = this.getView().byId("txtStartTime");
			var txtEndTime = this.getView().byId("txtEndTime");

			var oLabel = this.getView().byId("lblTime");
			var txtStatus = this.getView().byId("txtStatus");

			var oModelTrip = this.getOwnerComponent().getModel("TripSet");
			this.getView().setModel(oModelTrip);

			var oModel = this.getView().getModel();
			var oModelTrips = oModel.getProperty("/Trips");

			that._LoadGeoLocation(); // Get Geo Location
			var result = "";
			result = that.GetClock();

			for (var i = 0; i < oModel.getData().Trips.length; i++) {
				var finalresult = that._convertTo24hrFormat(result);
				var finalresultarray = [];
				finalresultarray = finalresult.split(":");

				var startTime = that._convertTo24hrFormat(txtStartTime.getText());
				var startTimearray = [];
				startTimearray = startTime.split(":");

				var endTime = that._convertTo24hrFormat(txtEndTime.getText());
				var endTimearray = [];
				endTimearray = endTime.split(":");

				var currDate = "";

				if (oModel.getData().Trips[i].Status === "ONGOING") {
					MessageBox.information("You can't start mupliple Trip");
					return false;
				}

				if (finalresultarray[0] >= startTimearray[0] && finalresultarray[0] <= endTimearray[0]) {
					if (oModel.getData().Trips[i].TripId.toString() === txtTripId.getText()) {

						var myLatitudevalue = "23.043";
						var myLongitudevalue = "72.529";
						//	var myLatitudevalue = parseFloat(myLatitude.getText().slice(0, 6));
						//	var myLongitudevalue = parseFloat(myLongitude.getText().slice(0, 6));
						var RouteLatFrom = parseFloat(oModel.getData().Trips[i].RouteLatFrom.slice(0, 6));
						var RouteLngFrom = parseFloat(oModel.getData().Trips[i].RouteLngFrom.slice(0, 6));
						var increment = parseInt(5);
						var myLatitudearray = [];
						myLatitudearray = myLatitudevalue.toString().split(".");
						var myLongitudearray = [];
						myLongitudearray = myLongitudevalue.toString().split(".");
						var RouteLatFromarray = [];
						RouteLatFromarray = RouteLatFrom.toString().split(".");
						var RouteLngFromarray = [];
						RouteLngFromarray = RouteLngFrom.toString().split(".");

						var maxLatFromvalue = parseInt(RouteLatFromarray[1]) + increment;
						if (RouteLatFromarray[1].startsWith("0") === true) {
							maxLatFromvalue = "0" + maxLatFromvalue;
						}
						var minLatFromvalue = parseInt(RouteLatFromarray[1]) - increment;
						if (RouteLatFromarray[1].startsWith("0") === true) {
							minLatFromvalue = "0" + minLatFromvalue;
						}
						var maxLngFromvalue = parseInt(RouteLngFromarray[1]) + increment;
						if (RouteLngFromarray[1].startsWith("0") === true) {
							maxLngFromvalue = "0" + maxLngFromvalue;
						}
						var minLngFromvalue = parseInt(RouteLngFromarray[1]) - increment;
						if (RouteLngFromarray[1].startsWith("0") === true) {
							minLngFromvalue = "0" + minLngFromvalue;
						}
						if (that._GetCuurentDate(currDate) === oModel.getData().Trips[i].AssignedDateFrom) {
							if (myLatitudearray[0] === RouteLatFromarray[0] && myLongitudearray[0] === RouteLngFromarray[0]) {
								if ((myLatitudearray[1] >= minLatFromvalue && myLatitudearray[1] <= maxLatFromvalue) &&
									(myLongitudearray[1] >= minLngFromvalue && myLongitudearray[1] <= maxLngFromvalue)) {
									oModel.getData().Trips[i].TripId = oModel.getData().Trips[i].TripId;
									oModel.getData().Trips[i].RegistrationNo = oModel.getData().Trips[i].RegistrationNo;
									oModel.getData().Trips[i].DriverName = oModel.getData().Trips[i].DriverName;
									oModel.getData().Trips[i].VehicleRouteFrom = oModel.getData().Trips[i].VehicleRouteFrom;
									oModel.getData().Trips[i].RouteLatFrom = oModel.getData().Trips[i].RouteLatFrom;
									oModel.getData().Trips[i].RouteLngFrom = oModel.getData().Trips[i].RouteLngFrom;
									oModel.getData().Trips[i].VehicleRouteTo = oModel.getData().Trips[i].VehicleRouteTo;
									oModel.getData().Trips[i].RouteLatTo = oModel.getData().Trips[i].RouteLatTo;
									oModel.getData().Trips[i].RouteLngTo = oModel.getData().Trips[i].RouteLngTo;
									oModel.getData().Trips[i].AssignedDateFrom = oModel.getData().Trips[i].AssignedDateFrom;
									//oModel.getData().Trips[i].AssignedDateTo = oModel.getData().Trips[i].AssignedDateTo;
									oModel.getData().Trips[i].AssignedTimeFrom = oModel.getData().Trips[i].AssignedTimeFrom;
									oModel.getData().Trips[i].AssignedTimeTo = oModel.getData().Trips[i].AssignedTimeTo;
									oModel.getData().Trips[i].Status = "ONGOING";
									oModel.getData().Trips[i].Type = "Success";
									oModel.getData().Trips[i].Comments = oModel.getData().Trips[i].Comments;
									txtStatus.setText(oModel.getData().Trips[i].Status);
									txtStatus.setType(oModel.getData().Trips[i].Type);
									oLabel.setVisible(true);
									btnStartTrip.setVisible(false);
									btnEndTrip.setVisible(true);
									//	that.getCurrentAddress();
									oModel.setProperty("/Trips", oModelTrips);
									setInterval(function () {
										oLabel.setText("Time : " + result);
									}, 1000);
									that.getCurrentLocationFirstEntry();
									//	that.getCurrentLocation();
									that.onRefresh();
									MessageToast.show("Trip Started", {
										icon: sap.m.MessageBox.Icon.SUCCESS,
										title: "Success",
										onClose: function (oAction) {
											btnStartTrip.setVisible(false);
											btnEndTrip.setVisible(true);

										}
									});
								} else {
									MessageBox.information("You can not End Trip because location is Not Matched");
									return false;
								}
							} else {
								MessageBox.information("You can not Start Trip because location is Not Matched");
								return false;
							}

						} else {
							MessageBox.information("You can not Start Trip because Date is Not Matched");
							return false;
						}

					} else {
						oModel.getData().Trips[i].TripId = oModel.getData().Trips[i].TripId;
						oModel.getData().Trips[i].RegistrationNo = oModel.getData().Trips[i].RegistrationNo;
						oModel.getData().Trips[i].DriverName = oModel.getData().Trips[i].DriverName;
						oModel.getData().Trips[i].VehicleRouteFrom = oModel.getData().Trips[i].VehicleRouteFrom;
						oModel.getData().Trips[i].RouteLatFrom = oModel.getData().Trips[i].RouteLatFrom;
						oModel.getData().Trips[i].RouteLngFrom = oModel.getData().Trips[i].RouteLngFrom;
						oModel.getData().Trips[i].VehicleRouteTo = oModel.getData().Trips[i].VehicleRouteTo;
						oModel.getData().Trips[i].RouteLatTo = oModel.getData().Trips[i].RouteLatTo;
						oModel.getData().Trips[i].RouteLngTo = oModel.getData().Trips[i].RouteLngTo;
						oModel.getData().Trips[i].AssignedDateFrom = oModel.getData().Trips[i].AssignedDateFrom;
						//	oModel.getData().Trips[i].AssignedDateTo = oModel.getData().Trips[i].AssignedDateTo;
						oModel.getData().Trips[i].AssignedTimeFrom = oModel.getData().Trips[i].AssignedTimeFrom;
						oModel.getData().Trips[i].AssignedTimeTo = oModel.getData().Trips[i].AssignedTimeTo;
						oModel.getData().Trips[i].Status = oModel.getData().Trips[i].Status;
						oModel.getData().Trips[i].Type = oModel.getData().Trips[i].Type;
						oModel.getData().Trips[i].Comments = oModel.getData().Trips[i].Comments;
					}
				} else {
					MessageBox.information("You can not Start Trip before Start Time");
					return false;
				}

			}

		},

		_EndTrip: function () {

			var myLatitude = this.getView().byId("txtLat");
			var myLongitude = this.getView().byId("txtLng");

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

			var btnStartTrip = this.getView().byId("btnStartTrip");
			var btnEndTrip = this.getView().byId("btnEndTrip");
			var txtTripId = this.getView().byId("txtTripId");

			var oModelTrip = this.getOwnerComponent().getModel("TripSet");
			this.getView().setModel(oModelTrip);

			var oModel = this.getView().getModel();
			var oModelTrips = oModel.getProperty("/Trips");
			var that = this;

			that._LoadGeoLocation();

			for (var i = 0; i < oModel.getData().Trips.length; i++) {

				if (oModel.getData().Trips[i].TripId.toString() === txtTripId.getText()) {

					var myLatitudevalue = "23.171";
					var myLongitudevalue = "72.574";

					//	var myLatitudevalue = parseFloat(myLatitude.getText().slice(0, 6));
					//	var myLongitudevalue = parseFloat(myLongitude.getText().slice(0, 6));
					var RouteLatTo = parseFloat(oModel.getData().Trips[i].RouteLatTo.slice(0, 6));
					var RouteLngTo = parseFloat(oModel.getData().Trips[i].RouteLngTo.slice(0, 6));
					var increment = 5;
					var myLatitudearray = [];
					myLatitudearray = myLatitudevalue.toString().split(".");
					var myLongitudearray = [];
					myLongitudearray = myLongitudevalue.toString().split(".");
					var RouteLatToarray = [];
					RouteLatToarray = RouteLatTo.toString().split(".");
					var RouteLngToarray = [];
					RouteLngToarray = RouteLngTo.toString().split(".");

					var maxLatTovalue = parseInt(RouteLatToarray[1]) + parseInt(increment);
					if (RouteLatToarray[1].startsWith("0") === true) {
						maxLatTovalue = "0" + maxLatTovalue;
					}
					var minLatTovalue = parseInt(RouteLatToarray[1]) - parseInt(increment);
					if (RouteLatToarray[1].startsWith("0") === true) {
						minLatTovalue = "0" + minLatTovalue;
					}
					var maxLngTovalue = parseInt(RouteLngToarray[1]) + parseInt(increment);
					if (RouteLngToarray[1].startsWith("0") === true) {
						maxLngTovalue = "0" + maxLngTovalue;
					}
					var minLngTovalue = parseInt(RouteLngToarray[1]) - parseInt(increment);
					if (RouteLngToarray[1].startsWith("0") === true) {
						minLngTovalue = "0" + minLngTovalue;
					}

					if (myLatitudearray[0] === RouteLatToarray[0] && myLongitudearray[0] === RouteLngToarray[0]) {
						if ((myLatitudearray[1] >= minLatTovalue && myLatitudearray[1] <= maxLatTovalue) &&
							(myLongitudearray[1] >= minLngTovalue && myLongitudearray[1] <= maxLngTovalue)) {

							oModel.getData().Trips[i].TripId = oModel.getData().Trips[i].TripId;
							oModel.getData().Trips[i].RegistrationNo = oModel.getData().Trips[i].RegistrationNo;
							oModel.getData().Trips[i].DriverName = oModel.getData().Trips[i].DriverName;
							oModel.getData().Trips[i].VehicleRouteFrom = oModel.getData().Trips[i].VehicleRouteFrom;
							oModel.getData().Trips[i].RouteLatFrom = oModel.getData().Trips[i].RouteLatFrom;
							oModel.getData().Trips[i].RouteLngFrom = oModel.getData().Trips[i].RouteLngFrom;
							oModel.getData().Trips[i].VehicleRouteTo = oModel.getData().Trips[i].VehicleRouteTo;
							oModel.getData().Trips[i].RouteLatTo = oModel.getData().Trips[i].RouteLatTo;
							oModel.getData().Trips[i].RouteLngTo = oModel.getData().Trips[i].RouteLngTo;
							oModel.getData().Trips[i].AssignedDateFrom = oModel.getData().Trips[i].AssignedDateFrom;
							//oModel.getData().Trips[i].AssignedDateTo = oModel.getData().Trips[i].AssignedDateTo;
							oModel.getData().Trips[i].AssignedTimeFrom = oModel.getData().Trips[i].AssignedTimeFrom;
							oModel.getData().Trips[i].AssignedTimeTo = oModel.getData().Trips[i].AssignedTimeTo;
							oModel.getData().Trips[i].Status = "COMPLETED";
							oModel.getData().Trips[i].Type = "Information";
							oModel.getData().Trips[i].Comments = oModel.getData().Trips[i].Comments;
							oModel.setProperty("/Trips", oModelTrips);
							var lblTime = this.getView().byId("lblTime");
							lblTime.setText("");

							MessageBox.success("Thanks for Trip", {
								icon: sap.m.MessageBox.Icon.SUCCESS,
								title: "Success",
								onClose: function (oAction) {
									btnStartTrip.setVisible(false);
									btnEndTrip.setVisible(false);
									oRouter.navTo("TripManager");
								}

							});
						} else {
							MessageBox.information("You can not End Trip because location is Not Matched");
							return false;
						}

					} else {
						MessageBox.information("You can not End Trip because location is Not Matched");
						return false;
					}

				} else {
					oModel.getData().Trips[i].TripId = oModel.getData().Trips[i].TripId;
					oModel.getData().Trips[i].RegistrationNo = oModel.getData().Trips[i].RegistrationNo;
					oModel.getData().Trips[i].DriverName = oModel.getData().Trips[i].DriverName;
					oModel.getData().Trips[i].VehicleRouteFrom = oModel.getData().Trips[i].VehicleRouteFrom;
					oModel.getData().Trips[i].RouteLatFrom = oModel.getData().Trips[i].RouteLatFrom;
					oModel.getData().Trips[i].RouteLngFrom = oModel.getData().Trips[i].RouteLngFrom;
					oModel.getData().Trips[i].VehicleRouteTo = oModel.getData().Trips[i].VehicleRouteTo;
					oModel.getData().Trips[i].RouteLatTo = oModel.getData().Trips[i].RouteLatTo;
					oModel.getData().Trips[i].RouteLngTo = oModel.getData().Trips[i].RouteLngTo;
					oModel.getData().Trips[i].AssignedDateFrom = oModel.getData().Trips[i].AssignedDateFrom;
					//	oModel.getData().Trips[i].AssignedDateTo = oModel.getData().Trips[i].AssignedDateTo;
					oModel.getData().Trips[i].AssignedTimeFrom = oModel.getData().Trips[i].AssignedTimeFrom;
					oModel.getData().Trips[i].AssignedTimeTo = oModel.getData().Trips[i].AssignedTimeTo;
					oModel.getData().Trips[i].Status = oModel.getData().Trips[i].Status;
					oModel.getData().Trips[i].Type = oModel.getData().Trips[i].Type;
					oModel.getData().Trips[i].Comments = oModel.getData().Trips[i].Comments;
				}

			}

		},

		onRefresh: function () {
			var that = this;
			//	that.onAdd();
			setInterval(function () {
				//	that.onAdd();
				that.getCurrentLocation();
			}, 10000);

		},

		_UpdateTable: function (address) {
			var oModelItems = new sap.ui.model.json.JSONModel();
			var otable = this.getView().byId("tblLocationUpdate");
			var that = this;

			var GetTime = that.GetClock();

			var item = {};
			var values = "";
			if (values.results === undefined) {
				values = {
					results: []

				};
			}
			item = {
				"Time": GetTime,
				"Location": address

			};

			values.results.push(item);
			oModelItems.setData(values);
			otable.setModel(oModelItems);

		},

		onAdd: function (address) {
			var that = this;
			var oModelItems = new sap.ui.model.json.JSONModel();

			var NTime = that.GetClock();
			//	var oLOcation = sap.ui.getCore().byId("__xmlview0--txtlocation-__clone0").getText();
			var otable = this.getView().byId("tblLocationUpdate");

			var oModelTableTemp = otable.getModel();
			if (oModelTableTemp.getData() !== null) {
				var valuesTemp = oModelTableTemp.getData();

				if (valuesTemp.results === undefined) {
					valuesTemp = {
						results: []
					};
				}
			}

			var oItem = new sap.m.ColumnListItem({
				cells: [

					new sap.m.Text({
						text: "{Time}",
						//	id: "txttimen"

					}),
					new sap.m.Text({
						text: "{Location}",
						//	id: "txtLocataionN"

					})
				]
			});

			var itemN = [];
			for (var i = 0; i < valuesTemp.results.length; i++) {
				var oTemp = valuesTemp.results[i];
				itemN = {
					"Time": NTime,
					"Location": address
				};
			}

			valuesTemp.results.push(itemN);
			oModelTableTemp.setData(valuesTemp);
			otable.setModel(oModelTableTemp);

			/*	var txtTimeN = sap.ui.getCore().byId("txttimen");
			txtTimeN.setText(Time);

			var txtLocationN = sap.ui.getCore().byId("txtLocataionN");
			txtLocationN.setText(oLOcation);
			
			var otable = this.getView().byId("tblLocationUpdate");
			otable.addItem(oItem);*/

		},

		getCurrentLocation: function () {
			var that = this;
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(function (position) {
					that.getCurrentAddress(position.coords.latitude, position.coords.longitude);
				});
			} else {
				MessageBox.error("Error in location");
			}
		},

		getCurrentAddress: function (lat, lng) {

			var geocoder;
			var that = this;
			geocoder = new google.maps.Geocoder();
			var latlng = "";
			var latlng = new google.maps.LatLng(lat, lng);
			//latlng = new google.maps.LatLng(23.043, 72.529);
			geocoder.geocode({
					'latLng': latlng
				},
				function (results, status) {
					if (status == google.maps.GeocoderStatus.OK) {
						if (results[0]) {
							var address = results[0].formatted_address;

							//		that._UpdateTable(address);
							that.onAdd(address);
						} else {
							MessageBox.show("address not found");
						}
					} else {
						MessageBox.show("Geocoder failed due to: " + status);
					}
				}
			);
		},

		getCurrentLocationFirstEntry: function () {
			var that = this;
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(function (position) {
					that.getCurrentAddressFirstEntry(position.coords.latitude, position.coords.longitude);
				});
			} else {
				MessageBox.error("Error in location");
			}
		},
		getCurrentAddressFirstEntry: function (lat, lng) {

			var geocoder;
			var that = this;
			geocoder = new google.maps.Geocoder();
			var latlng = "";
			//	var latlng = new google.maps.LatLng(lat, lng);
			latlng = new google.maps.LatLng(23.043, 72.529);
			geocoder.geocode({
					'latLng': latlng
				},
				function (results, status) {
					if (status == google.maps.GeocoderStatus.OK) {
						if (results[0]) {
							var address = results[0].formatted_address;

							that._UpdateTable(address);
							//	that.onAdd(address);
						} else {
							MessageBox.show("address not found");
						}
					} else {
						MessageBox.show("Geocoder failed due to: " + status);
					}
				}
			);
		},

	});

});