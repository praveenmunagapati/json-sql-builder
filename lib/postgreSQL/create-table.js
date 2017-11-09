'use strict';

const _ 		= require('lodash');

module.exports = function(sqlBuilder){
	/**
	 * @name CreateTable
	 * @summary Main operator to generate an `CREATE TABLE` Statement
	 *
	 * **Syntax**
	 * ```syntax
	 * CREATE { TEMPORARY [$temp] } { UNLOGGED [$unlogged] } TABLE { IF NOT EXISTS [$ine] } <$table>  (
	 * 	<$define> (columns, ..., CONSTRAINTS, ...);
	 * )
	 * { WITH [$with] (
	 * 	OIDS = TRUE|FALSE [$oids]
	 * )}
	 * { TABLESPACE [$tablespace] }
	 * ```
	 * @isddl true
	 * @postgres true
	 *
	 * @param query 	 {Object}		Specifies the details of the $create operator
	 */
	sqlBuilder.updateSyntax('$createTable', `
		CREATE { TEMPORARY [$temp] } { UNLOGGED [$unlogged] } TABLE { IF NOT EXISTS [$ine] } <$table>  (
			<$define> (columns, ..., CONSTRAINTS, ...);
		)
		{ WITH [$with] (
			OIDS = TRUE|FALSE [$oids]
		)}
		{ TABLESPACE [$tablespace] }
	`);

	/**
	 * @name $column
	 * @summary Main operator to define a column on the `CREATE TABLE` Statement for the `postgreSQL` language dialect.
	 *
	 * **Syntax**
	 * ```syntax
	 * [$type] [$length]
	 * 	{ NOT NULL [$notNull] }
	 * 	{ DEFAULT [$default] }
	 * 	{ GENERATED (BY DEFAULT | ALWAYS) AS IDENTITY [$identity] }
	 * 	{ PRIMARY KEY [$primary] }
	 * 	{ UNIQUE [$unique] }
	 * 	{ CHECK [$check] }
	 * 	{ REFERENCES [$references] }
	 * 	{ COLLATE [$collate] }
	 * ```
	 * @memberOf CreateTable.$define.$column
	 * @isddl true
	 * @postgres true
	 *
	 * @param query 	 {Object}		Specifies the details of the $create operator
	 */
	sqlBuilder.updateSyntax('$column', `
		[$type] [$length]
			{ NOT NULL [$notNull] }
			{ DEFAULT [$default] }
			{ GENERATED (BY DEFAULT | ALWAYS) AS IDENTITY [$identity] }
			{ PRIMARY KEY [$primary] }
			{ UNIQUE [$unique] }
			{ CHECK [$check] }
			{ REFERENCES [$references] }
			{ COLLATE [$collate] }
	`);

	/**
	 * @name $identity
	 * @summary Specifies the `GENERATED ALWAYS AS IDENTITY` option a column.
	 *
	 * @memberOf CreateTable.$define.$column
	 * @isddl true
	 * @postgres true
	 *
	 * @param value	 {String | Boolean}
	 * To use it, set the value to `true` or 'default'
	 *
	 * **Example**
	 *
	 * ```javascript
	 * $create: {
	 * 	$table: 'people',
	 * 	$define: {
	 * 		id: { $column: { $type: 'INTEGER', $identity: true } },
	 * 		...
	 * 	}
	 * 	...
	 * }
	 * ```
	 */
	sqlBuilder.registerHelper('$identity', function(query/*, outerQuery, identifier*/) {
		if (_.isBoolean(query)){
			return query ? 'GENERATED ALWAYS AS IDENTITY' : '';
		} else if (_.isString(query) && query == 'default'){
			return query ? 'GENERATED BY DEFAULT AS IDENTITY' : '';
		} else {
			throw new Error('$identity must either be a Boolean or String with the value "default".');
		}
	});

	/**
	 * @name $collate
	 * @summary Specifies the `COLLATE` option a column.
	 *
	 * @memberOf CreateTable.$define.$column
	 * @isddl true
	 * @postgres true
	 *
	 * @param value	 {String}
	 *
	 * **Example**
	 *
	 * ```javascript
	 * $create: {
	 * 	$table: 'people',
	 * 	$define: {
	 * 		last_name: { $column: { $type: 'TEXT', $collate: 'fr_FR.UTF8' } },
	 * 		...
	 * 	}
	 * 	...
	 * }
	 * ```
	 */
	sqlBuilder.registerHelper('$collate', function(query/*, outerQuery, identifier*/) {
		if (_.isString(query)){
			return 'COLLATE ' + this.quote(query);
		} else {
			throw new Error('$collate must be a String.');
		}
	});

	/**
	 * @name $unlogged
	 * @summary Specifies the `UNLOGGED` option for the `CREATE TABLE` statement.
	 *
	 * @memberOf CreateTable
	 * @isddl true
	 * @postgres true
	 *
	 * @param value	 {Boolean}
	 * If the value is set to `true` the `UNLOGGED` option will be used.
	 * **Example**
	 * ```javascript
	 * $create: {
	 * 	$table: 'people',
	 * 	$unlogged: true,
	 * 	...
	 * }
	 * ```
	 */
	sqlBuilder.registerHelper('$unlogged', function(query/*, outerQuery, identifier*/) {
		if (!_.isBoolean(query)){
			throw new Error('$unlogged must always be a Boolean.');
		}
		return query ? 'UNLOGGED' : '';
	});

	/**
	 * @name $with
	 * @summary Specifies the `WITH` clause for the `CREATE TABLE` statement.
	 *
	 * @memberOf CreateTable
	 * @isddl true
	 * @postgres true
	 *
	 * @param value	 {Object}
	 * Specifies the `storage parameters` and / or the `OIDS` support.
	 * **Example**
	 * ```javascript
	 * $create: {
	 * 	$table: 'people',
	 * 	$with: { $oids: true }
	 * 	...
	 * }
	 * ```
	 */
	sqlBuilder.registerHelper('$with', function(query/*, outerQuery, identifier*/) {
		if (!_.isPlainObject(query)){
			throw new Error('$with must always be an Object.');
		}
		return 'WITH (' + this.build(query) + ')';
	});

	/**
	 * @name $oids
	 * @summary Specifies the `OIDS` option within the `WITH` clause for the `CREATE TABLE` statement.
	 *
	 * @memberOf CreateTable
	 * @isddl true
	 * @postgres true
	 *
	 * @param value	 {Object}
	 * Specifies the `Storage Parameters` and the `OIDS` support.
	 * **Example**
	 * ```javascript
	 * $create: {
	 * 	$table: 'people',
	 * 	$with: { $oids: true }
	 * 	...
	 * }
	 * ```
	 */
	sqlBuilder.registerHelper('$oids', function(query/*, outerQuery, identifier*/) {
		if (!_.isBoolean(query)){
			throw new Error('$oids must always be a Boolean.');
		}
		return 'OIDS = ' + (query ? 'TRUE' : 'FALSE');
	});

	/**
	 * @name $tablespace
	 * @summary Specifies the `TABLESPACE` option for the `CREATE TABLE` statement.
	 *
	 * @memberOf CreateTable
	 * @isddl true
	 * @postgres true
	 *
	 * @param value	 {Object}
	 * Specifies the `TABLESPACE` option.
	 * **Example**
	 * ```javascript
	 * $create: {
	 * 	$table: 'people',
	 * 	$tablespace: 'my_table_space'
	 * 	...
	 * }
	 * ```
	 */
	sqlBuilder.registerHelper('$tablespace', function(query/*, outerQuery, identifier*/) {
		if (!_.isString(query)){
			throw new Error('$tablespace must always be a String.');
		}
		return 'TABLESPACE ' + this.quote(query);
	});

};