// Dependencies.
const password_validator = require ("password-validator");
const email_validator = require ("email-validator");
const dbmanager = require ("./db_manager.js");
const _ = require ("underscore");

// Database link configurations.
dbmanager.set_base_link ("mongodb+srv://it_manager:appsmanager@cluster0.v0aj1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority");

// Checks whether a number input field respects the imposed restrictions.
function _check_number_input (inp, ans) {
	// Converts the input into an integer.
	inp.value = parseInt (inp.value);
	// The input field value is it empty ?
	if (String (inp.value).length === 3) ans.errors.push ({id: inp.id, message: "Aucune valeur n'a pas été renseignée."});
	// Checks the value type.
	else if (isNaN (inp.value)) ans.errors.push ({id: inp.id, message: "La valeur n'est pas de type numérique."});
	// Checks the limit of the given value.
	else if (inp.value > 999999999999) ans.errors.push ({id: inp.id, message: "La valeur est hors des limites prédéfinies."});
}

// Checks whether a date input field respects the imposed restrictions.
function _check_date_input (inp, ans) {
	// Checks whether the date is empty.
	if (!inp.value.length) ans.errors.push ({id: inp.id, message: "La valeur de ce champ n'a pas été renseignée."});
	// Checks the date character count.
	else if (inp.value.length !== 10) ans.errors.push ({id: inp.id, message: "La date renseignée n'est pas valide."});
	// Checks the date separator.
	else if (!inp.value.includes ('/') && !inp.value.includes ('-') && !inp.value.includes ('\\')) {
		// Generates an error message.
		ans.errors.push ({id: inp.id, message: "La date ne respecte pas les conventions standard."});
	// Checks the date sections.
	} else {
		// Getting the date parts.
		let parts = [parseInt (inp.value.split () [0]), parseInt (inp.value.split () [1]), parseInt (inp.value.split () [2])];
		// Checks date parts value type.
		if (typeof parts [0] !== "number" && typeof parts [1] !== "number" && typeof parts [2] !== "number") {
			// Generates an error message.
			ans.errors.push ({id: inp.id, message: "Le format de la date renseignée est incorrecte."});
		}
	}
}

// Gets the current date from operating system.
function _get_date (real = false) {
	// Gets the current date.
	let today = new Date (); let dt = [String (today.getFullYear ()), String (today.getMonth () + 1), String (today.getDay ())];
	// Corrects the month and day value.
	dt [1] = ((dt [1].length < 2) ? ('0' + dt [1]) : dt [1]); dt [2] = ((dt [2].length < 2) ? ('0' + dt [2]) : dt [2]);
	// Parses the final value and returns it.
	return (!real ? (dt [0] + '-' + dt [1] + '-' + dt [2]) : new Date (today.getFullYear (), (today.getMonth () + 1), today.getDay ()));
}

// Parses a date given date as string format into a real date object instance.
function _parse_date (date) {
	// Contains some splited strings.
	let digits = date.split ('-'); let parts = [parseInt (digits [0]), parseInt (digits [1]), parseInt (digits [2])];
	// Returns a new instance of a date object.
	return new Date (parts [0], parts [1], parts [2]);
}

// Checks whether an email input field respects the imposed restrictions.
function _check_email_input (inp, ans) {
	// The given email is empty.
	if (!inp.value.length) ans.errors.push ({id: inp.id, message: "Ce champ n'a pas été renseigné."});
	// A character named '@' has been found.
	if (inp.value.includes ('@')) {
		// The passed email doesn't respect standard conventions.
		if (!email_validator.validate (inp.value)) ans.errors.push ({id: inp.id, message: "Le courrier électronique n'est pas valide."});
	// Otherwise.
	} else _check_name_input (inp, ans);
}

// Checks whether an phone number input field respects the imposed restrictions.
function _check_phone_input (inp, ans) {
	// Converts the input into an integer.
	inp.value = parseInt (inp.value);
	// The input field value is it empty ?
	if (!String (inp.value).length) ans.errors.push ({id: inp.id, message: "Le numéro de téléphone n'a pas été renseigné."});
	// Checks the limit of the given value.
	else if (String (inp.value).length !== 8) ans.errors.push ({id: inp.id, message: "Le numéro de téléphone donné est invalide."});
	// Checks the value type.
	else if (isNaN (inp.value)) ans.errors.push ({id: inp.id, message: "Ce champ n'est pas de type numérique."});
}

// Returns the original date
function _get_original_date (date) {
	// Divides the date into many parts.
	let parts = date.split (' '); switch (parts [1]) {
		case "Janvier": parts [1] = "01"; break; case "Février": parts [1] = "02"; break; case "Mars": parts [1] = "03"; break;
		case "Avril": parts [1] = "04"; break; case "Mai": parts [1] = "05"; break; case "Juin": parts [1] = "06"; break;
		case "Juillet": parts [1] = "07"; break; case "Août": parts [1] = "08"; break; case "Septembre": parts [1] = "09"; break;
		case "Octobre": parts [1] = "10"; break; case "Novembre": parts [1] = "11"; break; case "Décembre": parts [1] = "12"; break;
		default: parts [1] = "00"; break;
	// Returns the final.
	} return (parts [2] + '-' + parts [1] + '-' + parts [0]).replace ("undefined-00-", '');
}

// Checks whether a password input field respects the imposed restrictions.
function _check_password_input (inp, ans) {
	// Creates a password schema.
	let schema = new password_validator ();
	// Specifies password requirement.
	schema.has ().symbols (1, "On doit noté la présence d'au moins un symbol: @, !, #, $, &, +, *, -, %, etc...")
		.is ().max (16, "Le mot de passe doit comporté au maximum (16) caractères.")
		.has ().digits (2, "Le mot de passe doit contenir au moins (02) chiffres.")
		.is ().min (8, "Le mot de passe doit comporté au moins (08) caractères.")
		.has ().uppercase (1, "On doit avoir au moins une lettre majuscule.")
		.has ().lowercase (1, "La présence d'au moins une lettre minuscule.")
		.not ().spaces (1, "Les espaces ne sont pas tolérées.");
	// Checks password restrictions.
	let results = schema.validate (inp.value, new Object ({details: true}));
	// The input field value is it empty ?
	if (!inp.value.length) ans.errors.push (new Object ({id: inp.id, message: "Le mot de passe n'a pas été renseigné."}));
	// Checks a certains constraints.
	else if (Array.isArray (results) && results.length) ans.errors.push (new Object ({id: inp.id, message: results [0].message}));
}

// Checks whether a name is correct format.
function _check_name_input (inp, ans) {
	// Creates a password schema.
	let schema = new password_validator ();
	// Specifies password requirement.
	schema.not ().symbols (1, "On ne doit pas constaté la présence d'au moins l'un des symbols: !, #, $, &, +, *, -, %, etc...");
	// Checks password restrictions.
	let results = schema.validate (inp.value, new Object ({details: true}));
	// Checks a certains constraints.
	if (Array.isArray (results) && results.length) ans.errors.push (new Object ({id: inp.id, message: results [0].message}));
}

// Manages equipments providers statistics.
function _get_providers_statistics (equipments) {
	// Contains all providers.
	let providers_names = []; let providers_data = []; for (let eq of equipments) {
		// Gets index of the current provider identity.
		let index = providers_names.indexOf (eq.provider.name.toLowerCase () + '-' + eq.provider.surname.toLowerCase ());
		// The current provider is already exists into the providers names list.
		if (index === -1) {
			// Adds this provider name and surname.
			providers_data.push (_.extend (eq.provider, new Object ({problem_count: 1})));
			// Adds this provider data.
			providers_names.push (eq.provider.name.toLowerCase () + '-' + eq.provider.surname.toLowerCase ());
		// Otherwise.
		} else providers_data [index].problem_count += 1;
	// Returns the final result.
	} return providers_data;
}

// Establishes a connection to mongo database.
function _connect_to_db (success, result) {dbmanager.check_connection (db => success (db), () => result (new Object ({
	errors: "L'application rencontre des difficultées à se connecter à la base de données."})
));}

// Checks any input field value.
function _generic_checker (data) {
	// Converting the given data into an array.
	data = (Array.isArray (data) ? data : [data]); let answer = new Object ({errors: []});
	// Checking the passed input value.
	data.forEach (input => {
		// Corrects the passed value.
		let keys = [" > input", " > select", " > textarea"]; input.value = input.value.trimLeft ().trimRight ();
		input.id = input.id.replace (keys [0], '').replace (keys [1], '').replace (keys [2], '');
		// For text input field.
		if (input.type === "text") {
			// Is it a required field ?
			if (input.required) {
				// No value specified.
				if (!input.value.length) answer.errors.push ({id: input.id, message: "Aucune valeur renseignée."});
				// Otherwise.
				else if (input.restrictions) _check_name_input (input, answer);
			// A value has been specified.
			} else if (input.value.length) {if (input.restrictions) _check_name_input (input, answer);}
			// No value specified.
			else if (!input.value.length) input.value = null;
		// For number input field.
		} else if (input.type === "number") {
			// Is it a required field ?
			if (input.required) _check_number_input (input, answer); else if (input.value.length) _check_number_input (input, answer);
		// For input date field.
		} else if (input.type === "date") {
			// Is it a required field ?
			if (input.required) _check_date_input (input, answer); else if (input.value.length) _check_date_input (input, answer);
		// For email input field.
		} else if (input.type === "email") {
			// Is it a required field ?
			if (input.required) _check_email_input (input, answer); else if (input.value.length) _check_email_input (input, answer);
		// For phone number input field.
		} else if (input.type === "tel") {
			// Is it a required field ?
			if (input.required) _check_phone_input (input, answer); else if (input.value.length) _check_phone_input (input, answer);
		// For password input field.
		} else if (input.type === "password") {
			// Is it a required field ?
			if (input.required) _check_password_input (input, answer); else if (input.value.length) _check_password_input (input, answer);
		}
	// Checks whether some errors have been detected.
	}); answer.errors = (answer.errors.length ? answer.errors : false); return answer;
}

// Checks the given problem fields before add it to the database.
module.exports.add_problem = function add_problem (data, result) {
	// Connects app to the database.
	_connect_to_db (() => {
		// Contains some splited strings.
		data [3].value = data [3].value.replace ("ID: ", '').replace ("cd-", '');
		// Checks potentials errors on the given formulary fields.
		let answer = _generic_checker (data); if (typeof answer.errors === "boolean") {
			// Checks dropdown value.
			if (data [2].value.toLowerCase () != "aucun") {
				// Finds equipment that have the given id.
				dbmanager.find ("it_manager", "equipments", new Object ({query: new Object ({_id: data [3].value})}), res => {
					// Contains the problem date.
					let problem_date = _parse_date (data [0].value); let user_assign_date = _parse_date (res.affected_user.assign_date);
					// Checks the problem date.
					if (problem_date >= user_assign_date && problem_date < _parse_date (res.affected_user.expired_date)) {
						// Gets equipment history.
						let history = res.history; history.old_users.push (_.extend (res.affected_user, {cancel_date: data [0].value}));
						// Adds all affected services to history data.
						for (let service of res.affected_services) history.old_services.push (_.extend (service, new Object ({
							cancel_date: data [0].value
						// Updates the database.
						}))); dbmanager.update ("it_manager", "equipments", new Object ({problem: new Object ({
							date: data [0].value, description: data [1].value, solution: new Object ({date: null, description: null})
						}), using_state: "En panne", affected_user: {name: null, surname: null, address: null}, affected_services: [],
							history: history}), new Object ({_id: data [3].value}), false, response => result (new Object ({errors: false,
							message: ("Un problème a été signalé sur l'équipement <strong>" + data [2].value + "</strong>."),
							data: _.extend (response.data.problem, new Object ({_id: res._id, model: res.model, marque: res.marque}))
						})));
					// Otherwise.
					} else result (new Object ({errors: [{id: data [0].id, message: ("La date renseignée ne doit pas être hors des délais "
						+ " plafonds.")}]}));
				});
			// Otherwise.
			} else result (new Object ({errors: [{id: data [2].id, message: ("Aucun équipement n'a été sélectionné. Veuillez"
				+ " sélectionner un équipement sur lequel le problème a été signalé.")}]}));
		// Otherwise.
		} else result (answer);
	}, result);
}

// Checks the given solution fields before add it to the database.
module.exports.add_solution = function add_solution (data, result) {
	// Connects app to the database.
	_connect_to_db (() => {
		// Contains some splited strings.
		data [3].value = data [3].value.replace ("ID: ", '').replace ("cd-", '');
		// Checks potentials errors on the given formulary fields.
		let answer = _generic_checker (data); if (typeof answer.errors === "boolean") {
			// Finds equipment that have the given id.
			dbmanager.find ("it_manager", "equipments", new Object ({query: {_id: data [3].value}}), res => {let history = res.history;
				// Checks the solve date.
				if (_parse_date (data [0].value) >= _parse_date (res.problem.date)) {
					// Adds this resolved problem to history data.
					history.old_problems.push (_.extend (res.problem, {solution: {date: data [0].value, description: data [1].value}}));
					// Updates the database.
					dbmanager.update ("it_manager", "equipments", new Object ({problem: {date: null, description: null,
					solution: {date: null, description: null}}, history: history, using_state: "Non affecté"}),
						new Object ({_id: data [3].value}), false, () => result (new Object ({errors: false,
						message: ("Une solution a été proposée pour la réparation de l'équipement <strong>" + data [2].value + "</strong>.")
					})));
				// Otherwise.
				} else result (new Object ({errors: [{id: data [0].id, message: ("La date renseignée ne peut pas être inférieur à celle"
					+ " du problème déclaré ou en cours.")}]}));
			});
		// Otherwise.
		} else result (answer);
	}, result);
}

// Checks the given service fields before add it to the database.
module.exports.add_service = function add_service (data, result) {
	// Connects app to the database.
	_connect_to_db (() => {
		// Checks potentials errors on the given formulary fields.
		let answer = _generic_checker (data); if (typeof answer.errors === "boolean") {
			// Contains the request query.
			let query = new Object ({$and: [{type: {$regex: ('^' + data [3].value + '$'), $options: 'i'}}, {provider:
				{$regex: ('^' + data [2].value + '$'), $options: 'i'}}]});
			// Checks whether the specified service is already exists on the database.
			dbmanager.find ("it_manager", "services", new Object ({query: query}), res => {
				// No resuts found.
				if (res == null) {
					// Inserts the given formulary data into the database.
					dbmanager.insert ("it_manager", "services", new Object ({
						reference: data [0].value, address: data [1].value, provider: data [2].value, type: data [3].value,
					}), states => result (new Object ({
						message: ("Le service <strong>" + states.data.provider + "</strong> de type <strong>" + states.data.type
						+ "</strong> a été correctement mis sur le parc."), errors: false, data: new Object ({
							ID: states.data._id, "Adresse du prestataire": states.data.address, Prestataire: states.data.provider,
							"Référence": ((typeof states.data.reference === "string") ? states.data.reference : null),
							Type: states.data.type, disabled: ["ID"]
						})
					})));
				// Otherwise.
				} else result ({errors: ("Le service <strong>" + data [2].value + "</strong> de type <strong>" + data [3].value
					+ "</strong> a déjà été enregistré sur le parc.")
				});
			});
		// Otherwise.
		} else result (answer);
	}, result);
}

// Checks the given user fields before add it to the database.
module.exports.add_user = function add_user (data, result) {
	// Connects app to the database.
	_connect_to_db (() => {
		// Checks potentials errors on the given formulary fields.
		let answer = _generic_checker (data); if (typeof answer.errors === "boolean") {
			// Contains the request query.
			let query = new Object ({$and: [{name: {$regex: ('^' + data [0].value + '$'), $options: 'i'}}, {surname:
				{$regex: ('^' + data [1].value + '$'), $options: 'i'}}]});
			// Checks whether the specified user is already exists on the database.
			dbmanager.find ("it_manager", "users", new Object ({query: query}), res => {
				// No resuts found.
				if (res == null) {
					// Inserts the given formulary data into the database.
					dbmanager.insert ("it_manager", "users", new Object ({
						name: data [0].value, surname: data [1].value, address: data [2].value
					}), states => result (new Object ({
						message: ("L'utilisateur <strong>" + states.data.surname + ' ' + states.data.name.toUpperCase () + "</strong>"
						+ " a été correctement ajouté au parc."), errors: false, data: new Object ({
							ID: states.data._id, "Adresse": states.data.address, Nom: states.data.name,
							"Prénom(s)": states.data.surname, disabled: ["ID"]
						})
					})));
				// Otherwise.
				} else result (new Object ({errors: ("L'utilisateur <strong>" + data [1].value + ' ' + data [0].value + "</strong>"
					+ " a déjà été enregistré sur le parc.")
				}));
			});
		// Otherwise.
		} else result (answer);
	}, result);
}

// Checks the given equipment fields before add it to the database.
module.exports.add_equipment = function add_equipment (data, result) {
	// Connects app to the database.
	_connect_to_db (() => {
		// Checks potentials errors on the given formulary fields.
		let answer = _generic_checker (data); if (typeof answer.errors === "boolean") {
			// Checks whether the specified equipment is already exists on the database.
			dbmanager.find ("it_manager", "equipments", new Object ({query: new Object ({model: {$regex: ('^' + data [2].value + '$'),
			$options: 'i'}})}), res => {
				// No resuts found.
				if (res == null) {
					// Inserts the given formulary data into the database.
					dbmanager.insert ("it_manager", "equipments", new Object ({
						reference: data [0].value, marque: data [1].value, model: data [2].value, buy_date: data [6].value,
						using_state: data [4].value, price: parseInt (data [9].value), buy_state: data [10].value,
						description: data [5].value, provider: {
							surname: data [3].value, address: data [7].value, phone_number: parseInt (data [8].value),
							name: data [11].value.toUpperCase ()
						}, affected_user: {name: null, surname: null, address: null}, affected_services: [], history: {
							old_users: [], old_problems: [], old_services: []
						}, problem: {date: null, description: null, solution: {date: null, description: null}}
					}), states => result (new Object ({
						message: ("L'équipement <strong>" + states.data.model + " - " + states.data.marque
						+ "</strong> a été correctement mis sur le parc."), errors: false, data: new Object ({
							Model: states.data.model, ID: states.data._id, "Adresse du fournisseur": states.data.provider.address,
							"Caractères technique": states.data.description, "Date d'achat": states.data.buy_date,
							"Etat d'achat": states.data.buy_state, "Etat d'utilisation": states.data.using_state,
							Fournisseur: (states.data.provider.surname + ' ' + states.data.provider.name.toUpperCase ()),
							Marque: states.data.marque, Prix: states.data.price,
							"Référence": ((typeof states.data.reference === "string") ? states.data.reference : null),
							"Téléphone du fournisseur": states.data.provider.phone_number, disabled: ["Model", "ID"]
						})
					})));
				// Otherwise.
				} else result (new Object ({errors: ("L'équipement <strong>" + data [2].value + " - " + data [1].value
					+ "</strong> a été déjà enregistré sur le parc.")
				}));
			});
		// Otherwise.
		} else result (answer);
	}, result);
}

// Loads availables equipments from the database.
module.exports.load_availables_equipments = function load_availables_equipments (result) {
	// Connects app to the database.
	_connect_to_db (() => {
		// Contains the request query.
		let query = new Object ({$or: [{using_state: "Non affecté"}, {using_state: "Hors du parc"}]});
		// Checks whether the specified equipment is already exists on the database.
		dbmanager.find ("it_manager", "equipments", new Object ({query: query}), res => result (new Object ({data: res})), true);
	}, result);
}

// Loads maintenance equipments from the database.
module.exports.load_maintenance_equipments = function load_maintenance_equipments (result) {
	// Connects app to the database.
	_connect_to_db (() => {
		// Contains the request query.
		let query = new Object ({using_state: "En panne"});
		// Checks whether the specified equipment is already exists on the database.
		dbmanager.find ("it_manager", "equipments", new Object ({query: query}), res => result (new Object ({data: res})), true);
	}, result);
}

// Loads service equipments from the database.
module.exports.load_service_equipments = function load_service_equipments (result) {
	// Connects app to the database.
	_connect_to_db (() => {
		// Contains the request query.
		let query = new Object ({using_state: "Affecté"});
		// Checks whether the specified equipment is already exists on the database.
		dbmanager.find ("it_manager", "equipments", new Object ({query: query}), res => result (new Object ({data: res})), true);
	}, result);
}

// Loads availables services from the database.
module.exports.load_availables_services = function load_availables_services (eq_id, result) {
	// Connects app to the database.
	_connect_to_db (() => {
		// A data has been refered.
		if (typeof eq_id === "string") {
			// Finds equipment that have the given id.
			dbmanager.find ("it_manager", "equipments", new Object ({query: new Object ({_id: eq_id})}), res => {
				// Searches all logged services from the database.
				dbmanager.find ("it_manager", "services", new Object ({query: new Object ({})}), response => {
					// No results found.
					if (response == null || Array.isArray (response) && !response.length) result (new Object ({data: []}));
					// Otherwise.
					else {
						// No affected services found.
						if (!res.affected_services.length) result (new Object ({data: response}))
						// Otherwise.
						else result ({data: _.filter (response, service => {
							// Listing all affected services.
							for (let affected_service of res.affected_services) {
								// If ever a standard service is already affected to this equipment.
								if (affected_service.service_provider.toLowerCase ().includes (service.provider.toLowerCase ())) {
									// Checks services type.
									if (affected_service.type.toLowerCase ().includes (service.type.toLowerCase ())) {
										// Checks whether this service is expired or not.
										if (_parse_date (affected_service.expired_date) <= _get_date (true)) return true;
										// Otherwise.
										else return false;
									}
								}
							// This standard service is not affected to this equipment.
							} return true;
						})});
					}
				}, true);
			});
		// Otherwise.
		} else dbmanager.find ("it_manager", "services", new Object ({query: new Object ({})}), response => {
			// No results found.
			if (response == null || Array.isArray (response) && !response.length) result (new Object ({data: []}));
			// Otherwise.
			else result (new Object ({data: response}));
		}, true);
	}, result);
}

// Loads availables users from the database.
module.exports.load_availables_users = function load_availables_users (eq_id, result) {
	// Connects app to the database.
	_connect_to_db (() => {
		// A data has been refered.
		if (typeof eq_id === "string") {
			// Finds equipment that have the given id.
			dbmanager.find ("it_manager", "equipments", new Object ({query: new Object ({_id: eq_id})}), res => {
				// Finds all logged users on the database.
				dbmanager.find ("it_manager", "users", new Object ({query: new Object ({})}), response => {
					// No results found.
					if (response == null || Array.isArray (response) && !response.length) result (new Object ({data: []}));
					// Otherwise.
					else result (new Object ({data: _.filter (response, user => {
						// Constraints for getting users that aren't affected to the current loaded equipment.
						return (res.affected_user.name !== user.name || res.affected_user.surname !== user.surname);
					})}));
				}, true);
			});
		// Otherwise.
		} else dbmanager.find ("it_manager", "users", new Object ({query: new Object ({})}), response => {
			// No results found.
			if (response == null || Array.isArray (response) && !response.length) result (new Object ({data: []}));
			// Otherwise.
			else result (new Object ({data: response}));
		}, true);
	}, result);
}

// Manages assignments to an equipment.
module.exports.assignment = function assignment (data, result) {
	// Connects app to the database.
	_connect_to_db (() => { 
		// Contains some splited strings.
		data.data [3].value = data.data [3].value.replace ("ID: ", '').replace ("cd-", '');
		// Checks potentials errors on the given formulary fields.
		let answer = _generic_checker (data.data); if (typeof answer.errors === "boolean") {
			// Compares the given dates.
			if (_parse_date (data.data [0].value) < _parse_date (data.data [1].value)) {
				// Checks dropdown value.
				if (data.data [2].value.toLowerCase () != "aucun") {
						// Finds equipment that have the given id.
						dbmanager.find ("it_manager", "equipments", new Object ({query: new Object ({_id: data.data [3].value})}), res => {
							// Checks assign date.
							if (_parse_date (data.data [0].value) >= _parse_date (res.buy_date)) {
								// For service management.
								if (data.additional.ref === "service") {
									// Adds the current service to the selected equipment.
									let afd_srv = res.affected_services; afd_srv.push (new Object ({
										service_provider: data.additional.Prestataire,
										address: data.additional ["Adresse du prestataire"], reference: data.additional ["Référence"],
										type: data.additional.Type, assign_date: data.data [0].value, expired_date: data.data [1].value
									// Updates the database.
									})); dbmanager.update ("it_manager", "equipments", new Object ({affected_services: afd_srv}),
									{_id: data.data [3].value}, false, () => result (new Object ({errors: false,
										message: ("L'équipement <strong>"
										+ data.data [2].value + "</strong> a été correctement affecté au service <strong>"
										+ data.additional.Prestataire + "</strong> de type <strong>" + data.additional.Type + "</strong>.")
									})));
								// For user management.
								} else if (data.additional.ref === "user") dbmanager.update ("it_manager", "equipments",
									new Object ({affected_user: new Object ({
										name: data.additional.Nom, surname: data.additional ["Prénom(s)"], address: data.additional.Adresse,
										assign_date: data.data [0].value, expired_date: data.data [1].value
									}), using_state: "Affecté"}), new Object ({_id: data.data [3].value}), false, () => result (new Object ({
									errors: false, message: ("L'équipement <strong>" + data.data [2].value
									+ "</strong> a été correctement affecté à l'utilisateur <strong>" + data.additional ["Prénom(s)"]
									+ ' ' + data.additional.Nom.toUpperCase () + "</strong>.")
								})));
							// Otherwise.
							} else result (new Object ({errors: [{id: data.data [0].id, message: ("La date d'affectation ne peut être en"
								+ " aucun cas inférieur à celle d'achat du produit.")}]}));
						});
				// Otherwise.
				} else result (new Object ({errors: [{id: data.data [2].id, message: ("Aucun équipement n'a été sélectionné. Veuillez"
					+ " sélectionner un équipement à affecté au service sélectionné.")}]}));
			// Otherwise.
			} else result (new Object ({errors: [{id: data.data [1].id, message: ("La date d'expiration ne peut être en aucun cas" +
				" inférieur ou égale à celle de début")}]}));
		// Otherwise.
		} else result (answer);
	}, result);
}

// Manages unassignments to an equipment.
module.exports.unassignment = function unassignment (data, result) {
	// Connects app to the database.
	_connect_to_db (() => {
		// Filters the given id.
		data.data [2].value = data.data [2].value.replace ("ID: ", '').replace ("cd-", '');
		// Corrects the filtered id whether needed.
		data.data [2].value = ((data.data [2].value.indexOf ('-') > -1) ? data.data [2].value.split ('-') [0] : data.data [2].value);
		// Checks potentials errors on the given formulary fields.
		let answer = _generic_checker (data.data); if (typeof answer.errors === "boolean") {
			// Finds equipment that have the given id.
			dbmanager.find ("it_manager", "equipments", new Object ({query: new	 Object ({_id: data.data [2].value})}), res => {
				// Parses the canceling date.
				let cancel_date = _parse_date (data.data [0].value); let dates = [null, null];
				// For user management.
				if (data.additional.ref === "user") {
					// Parses the target dates.
					dates [0] = _parse_date (res.affected_user.assign_date); dates [1] = _parse_date (res.affected_user.expired_date);
					// Checks whether the given canceling date respects the given constraints.
					if (cancel_date >= dates [0] && cancel_date < dates [1]) {
						// Gets equipment history and the affected user from the current equipment.
						let history = res.history; let afd_user = res.affected_user;
						// Adds the affected user to old users list.
						history.old_users.push (_.extend (afd_user, new Object ({cancel_date: data.data [0].value})));
						// Updates the database.
						dbmanager.update ("it_manager", "equipments", {affected_user: {name: null, surname: null, address: null},
						using_state: "Non affecté", history: history}, {_id: data.data [2].value}, false, () => result (new Object ({
							errors: false, message: ("L'équipement <strong>" + data.data [1].value
							+ "</strong> a été retirer de l'utilisateur <strong>" + afd_user.surname + ' ' + afd_user.name + "</strong>.")
						})));
					// Otherwise.
					} else result (new Object ({errors: [{id: data.data [0].id, message: ("Vous devez renseigner une date qui ne "
						+ "doit pas dépassée les délais plafonds.")}]}));
				// For service management.
				} else if (data.additional.ref === "service") {
					// Contains the service that will be unassigned.
					let serv = new Object ({provider: data.additional.Prestataire, address: data.additional ["Adresse du prestataire"],
						assign_date: _get_original_date (data.additional ["Date d'affectation"]), cancel_date: data.data [0].value,
						expired_date: _get_original_date (data.additional ["Date d'expiration"]), type: data.additional.Type,
						reference: (data.additional.hasOwnProperty ("Référence") ? data.additional ["Référence"] : null)
					// Removes the old service assignment from the affected services list.
					}); let afd_services = _.filter (res.affected_services, obj => {
						// Checks the service date.
						if (serv.assign_date === obj.assign_date && serv.expired_date === obj.expired_date) {
							// Constraints to removing the target service of an unassignment.
							return (obj.service_provider === serv.provider && obj.type !== serv.type ||
								obj.service_provider !== serv.provider);
						// Otherwise.
						} else return true;
					// Adds the affected user to old users list.
					}); let history = res.history; history.old_services.push (serv);
					// The given canceling date respects the imposed constraints.
					if (cancel_date >= _parse_date (serv.assign_date) && cancel_date < _parse_date (serv.expired_date)) {
						// Updates the database.
						dbmanager.update ("it_manager", "equipments", new Object ({affected_services: afd_services, history: history}),
						new Object ({_id: data.data [2].value}), false, () => result (new Object ({
							errors: false, message: ("L'équipement <strong>" + data.data [1].value
							+ "</strong> a été retirer du service <strong>" + serv.provider + "</strong> de type "
							+ serv.type + "</strong>.")
						})));
					// Otherwise.
					} else result (new Object ({errors: [{id: data.data [0].id, message: ("Vous devez renseigner une date qui ne doit"
						+ " pas être hors des délais plafonds.")}]}));
				}
			});
		// Otherwise.
		} else result (answer);
	}, result);
}

// Gets out an equipment.
module.exports.get_out = function get_out (data, result) {
	// Connects app to the database.
	_connect_to_db (() => {
		// Gets out the target equipment.
		dbmanager.update ("it_manager", "equipments", new Object ({using_state: "Hors du parc",
		problem: {date: null, description: null, solution: {date: null, description: null}}}), new Object ({_id: data.id}),
		false, () => result (new Object ({errors: false, message: ("L'équipement <strong>" + data.model + " - " + data.marque
			+ "</strong> est maintenant mis hors du parc.")
		})));
	}, result);
}

// Returns all data history from an equipment.
module.exports.load_history_data = function load_history_data (eq_id, result) {
	// Connects app to the database.
	_connect_to_db (() => {
		// Finds equipment that have the given id.
		dbmanager.find ("it_manager", "equipments", new Object ({query: new Object ({_id: eq_id})}), res => result ({data: res}));
	}, result);
}

// Loads all allowed equipment(s) for the given service.
module.exports.load_allowed_service_equipments = function load_allowed_service_equipments (data, result) {
	// Connects app to the database.
	_connect_to_db (() => {
		// Contains the search query.
		let query = new Object ({$or: [{using_state: "Hors du parc"}, {using_state: "Non affecté"}, {using_state: "Affecté"}]});
		// Finds all equipments from the database.
		dbmanager.find ("it_manager", "equipments", new Object ({query: query}), res => {
			// Returns all equipments whitch this service isn't affected or expired.
			result ({data: _.filter (res, obj => {
				// Returns all services that are different of the passed service.
				return (_.filter (obj.affected_services, item => {
					// A service has been found.
					if (item.service_provider === data.Prestataire && item.type === data.Type) {
						// Is it expired ?
						if (_parse_date (item.expired_date) <= _get_date (true)) return false; else return true;
					// Otherwise.
					} else return false;
				}).length === 0);
			})});
		}, true);
	}, result);
}

// Loads running services from the database.
module.exports.load_running_services = function load_running_services (result) {
	// Connects app to the database.
	_connect_to_db (() => {
		// Finds all equipments from the database.
		dbmanager.find ("it_manager", "equipments", new Object ({query: new Object ({})}), res => {
			// Filtering all running services.
			let services = []; for (let eq of res) eq.affected_services.forEach (service => {
				// Whether the current service is running.
				if (_parse_date (service.expired_date) > _get_date (true)) {
					// Adds the current service to found result.
					services.push (_.extend (service, new Object ({model: eq.model, marque: eq.marque, _id: eq._id})));
				}
			// Returns the final result.
			}); result (new Object ({data: services}));
		}, true);
	}, result);
}

// Loads expired services from the database.
module.exports.load_expired_services = function load_expired_services (result) {
	// Connects app to the database.
	_connect_to_db (() => {
		// Finds all equipments from the database.
		dbmanager.find ("it_manager", "equipments", new Object ({query: new Object ({})}), res => {
			// Filtering all running services.
			let services = []; for (let eq of res) eq.affected_services.forEach (service => {
				// Whether the current service is running.
				if (_parse_date (service.expired_date) <= _get_date (true)) {
					// Adds the current service to found result.
					services.push (_.extend (service, new Object ({model: eq.model, marque: eq.marque, _id: eq._id})));
				}
			// Returns the final result.
			}); result (new Object ({data: services}));
		}, true);
	}, result);
}

// Loads all affected users from the database.
module.exports.load_affected_users = function load_affected_users (result) {
	// Connects app to the database.
	_connect_to_db (() => {
		// Finds all equipments from the database.
		dbmanager.find ("it_manager", "equipments", new Object ({query: new Object ({})}), res => {
			// Contains all affected users.
			let affected_users = []; res = (Array.isArray (res) ? res : [res]);
			// Getting all affected users from the loaded equipments.
			for (let eq of res) if (eq.affected_user.name != null) affected_users.push (_.extend (eq.affected_user, new Object ({
				model: eq.model, marque: eq.marque, _id: eq._id
			// Returns the final result.
			}))); result (new Object ({data: affected_users}));
		}, true);
	}, result);
}

// Loads all availables problems from the database.
module.exports.load_availables_problems = function load_availables_problems (result) {
	// Connects app to the database.
	_connect_to_db (() => {
		// Finds all equipments from the database.
		dbmanager.find ("it_manager", "equipments", new Object ({query: new Object ({})}), res => {
			// Contains all availables problems.
			let problems = []; res = (Array.isArray (res) ? res : [res]);
			// Getting all availables problems from the loaded equipments.
			for (let eq of res) if (eq.problem.date != null) problems.push (_.extend (eq.problem, new Object ({
				model: eq.model, marque: eq.marque, _id: eq._id
			// Returns the final result.
			}))); result (new Object ({data: problems}));
		}, true);
	}, result);
}

// Loads all goods providers from the database.
module.exports.load_goods_providers = function load_goods_providers (result) {
	// Connects app to the database.
	_connect_to_db (() => {
		// Finds all equipments from the database.
		dbmanager.find ("it_manager", "equipments", new Object ({query: new Object ({using_state: "En panne"})}), res => {
			// Returns all goods providers.
			result (new Object ({data: _.filter (_get_providers_statistics (res), obj => {return (obj.problem_count < 3);})}));
		}, true);
	}, result);
}

// Loads all bads providers from the database.
module.exports.load_bads_providers = function load_bads_providers (result) {
	// Connects app to the database.
	_connect_to_db (() => {
		// Finds all equipments from the database.
		dbmanager.find ("it_manager", "equipments", new Object ({query: new Object ({using_state: "En panne"})}), res => {
			// Returns all goods providers.
			result (new Object ({data: _.filter (_get_providers_statistics (res), obj => {return (obj.problem_count >= 3);})}));
		}, true);
	}, result);
}

// Sign up management.
module.exports.sign_up = function sign_up (data, result) {
	// Connects app to the database.
	_connect_to_db (() => {
		// Checks potentials errors on the given formulary fields.
		let answer = _generic_checker (data); if (typeof answer.errors === "boolean") {
			// Checks password confirmation.
			if (data [1].value === data [2].value) {
				// Inserts the given formulary data into the database.
				dbmanager.insert ("it_manager", "administrators", new Object ({login: data [0].value, password: data [1].value}),
				states => result (new Object ({errors: false})));
			// Otherwise.
			} else result (new Object ({errors: [new Object ({message: "Le mot de passe n'a pas été confirmer."})]}))
		// Otherwise.
		} else result (answer);
	}, result);
}

// Sign in management.
module.exports.sign_in = function sign_in (data, result) {
	// Connects app to the database.
	_connect_to_db (() => {
		// Contains the search and update query.
		let query = new Object ({login: (!data [0].value.includes ('@') ? new Object ({$regex: ('^' + data [0].value + '$'),
			$options: 'i'}) : data [0].value), password: data [1].value});
		// Checks the passed user login into database.
		dbmanager.find ("it_manager", "administrators", new Object ({query: query}), res => {
			// The passed administrator is defined.
			if (res != null) result (new Object ({errors: false, user_id: data [0].value.trimLeft ().trimRight ()}));
			// Otherwise.
			else result (new Object ({errors: [new Object ({message: "Votre identifiant ou mot de passe n'est pas valide."})]}));
		});
	}, result);
}
