'use strict';

const expect     = require('chai').expect;
const SQLBuilder = require('../../index');
const SQLQuery   = require('../../lib/sqlquery');

var sqlbuilder   = new SQLBuilder();

describe('ANSI Query Operators', function() {
	describe('$select: { ... }', function() {

		describe('$from', function() {
			it('should return SELECT ... FROM `table-identifier`', function() {
				var query = sqlbuilder.build({
					$select: {
						$from: 'people'
					}
				});

				expect(query).to.be.instanceOf(SQLQuery);
				expect(query.sql).to.equal('SELECT * FROM `people`');
				expect(query.values.length).to.equal(0);
			});
		});

		describe('$table', function() {
			it('should return SELECT ... FROM `table-identifier`', function() {
				var query = sqlbuilder.build({
					$select: {
						$table: 'people'
					}
				});

				expect(query).to.be.instanceOf(SQLQuery);
				expect(query.sql).to.equal('SELECT * FROM `people`');
				expect(query.values.length).to.equal(0);
			});
		});

		describe('$table: { $as: <aliasname> }', function() {
			it('should return SELECT ... FROM `table-identifier` AS `alias`', function() {
				var query = sqlbuilder.build({
					$select: {
						$table: { people: { $as: 'alias_people' } }
					}
				});

				expect(query).to.be.instanceOf(SQLQuery);
				expect(query.sql).to.equal('SELECT * FROM `people` AS `alias_people`');
				expect(query.values.length).to.equal(0);
			});
		});

		describe('$columns: [...] | {...}', function() {
			it('should return all column object-properties concatenated with `, `', function() {
				var query = sqlbuilder.build({
					$select: {
						$columns: {
							fixvalue: 'foo',
							first_name: { $val: 'John' },
							last_name: { $as: 'alias_last_name' },
							gender: { $val: 'male' }
						},
						$table: 'people'
					}
				});

				expect(query).to.be.instanceOf(SQLQuery);
				expect(query.sql).to.equal('SELECT ? AS `fixvalue`, ? AS `first_name`, `last_name` AS `alias_last_name`, ? AS `gender` FROM `people`');
				expect(query.values.length).to.equal(3);
				expect(query.values[0]).to.equal('foo');
				expect(query.values[1]).to.equal('John');
				expect(query.values[2]).to.equal('male');
			});

			it('should return all column array-items (strings) concatenated with `, `', function() {
				var query = sqlbuilder.build({
					$select: {
						$columns: ['first_name', 'last_name'],
						$table: 'people'
					}
				});

				expect(query).to.be.instanceOf(SQLQuery);
				expect(query.sql).to.equal('SELECT `first_name`, `last_name` FROM `people`');
				expect(query.values.length).to.equal(0);
			});

			it('should return all column array-items (objects) concatenated with `, `', function() {
				var query = sqlbuilder.build({
					$select: {
						$columns: [
							{ first_name: { $val: 'John' } },
							{ last_name: { $as: 'alias_last_name' } },
							{ gender: { $val: 'male' } }
						],
						$table: 'people'
					}
				});

				expect(query).to.be.instanceOf(SQLQuery);
				expect(query.sql).to.equal('SELECT ? AS `first_name`, `last_name` AS `alias_last_name`, ? AS `gender` FROM `people`');
				expect(query.values.length).to.equal(2);
				expect(query.values[0]).to.equal('John');
				expect(query.values[1]).to.equal('male');
			});
		});

		describe('$distinct: true | false', function() {
			it('should return DISTINCT on true', function() {
				var query = sqlbuilder.build({
					$select: {
						$distinct: true,
						$columns: ['first_name', 'last_name'],
						$table: 'people'
					}
				});

				expect(query).to.be.instanceOf(SQLQuery);
				expect(query.sql).to.equal('SELECT DISTINCT `first_name`, `last_name` FROM `people`');
				expect(query.values.length).to.equal(0);
			});

			it('should return empty string on false', function() {
				var query = sqlbuilder.build({
					$select: {
						$distinct: false,
						$columns: ['first_name', 'last_name'],
						$table: 'people'
					}
				});

				expect(query).to.be.instanceOf(SQLQuery);
				expect(query.sql).to.equal('SELECT `first_name`, `last_name` FROM `people`');
				expect(query.values.length).to.equal(0);
			});
		});

		describe('$where: { ... }', function() {
			it('should return WHERE with all object-expressions concatenated by AND', function() {
				var query = sqlbuilder.build({
					$select: {
						$table: 'people',
						$where: {
							first_name: 'John',
							last_name: 'Doe'
						}
					}
				});

				expect(query).to.be.instanceOf(SQLQuery);
				expect(query.sql).to.equal('SELECT * FROM `people` WHERE `first_name` = ? AND `last_name` = ?');
				expect(query.values.length).to.equal(2);
				expect(query.values[0]).to.equal('John');
				expect(query.values[1]).to.equal('Doe');
			});

			it('should return WHERE with all object-expressions using comparison operator $eq concatenated by AND ', function() {
				var query = sqlbuilder.build({
					$select: {
						$table: 'people',
						$where: {
							first_name: 'John',
							last_name: { $eq: 'Doe' }
						}
					}
				});

				expect(query).to.be.instanceOf(SQLQuery);
				expect(query.sql).to.equal('SELECT * FROM `people` WHERE `first_name` = ? AND `last_name` = ?');
				expect(query.values.length).to.equal(2);
				expect(query.values[0]).to.equal('John');
				expect(query.values[1]).to.equal('Doe');
			});

			it('should return WHERE with all object-expressions with mixed logical and comparison operators $and, $or, $eq', function() {
				var query = sqlbuilder.build({
					$select: {
						$table: 'people',
						$where: {
							$and : [
								{ first_name: 'John' },
								{ last_name: { $eq: 'Doe' } },
								{ $or : [
									{ age : { $gt: 18 } },
									{ gender : { $ne: 'female' } }
								]}
							]
						}
					}
				});

				expect(query).to.be.instanceOf(SQLQuery);
				expect(query.sql).to.equal('SELECT * FROM `people` WHERE `first_name` = ? AND `last_name` = ? AND (`age` > ? OR `gender` != ?)');
				expect(query.values.length).to.equal(4);
				expect(query.values[0]).to.equal('John');
				expect(query.values[1]).to.equal('Doe');
				expect(query.values[2]).to.equal(18);
				expect(query.values[3]).to.equal('female');
			});

			it('should return WHERE with all object-expressions concatenated by OR', function() {
				var query = sqlbuilder.build({
					$select: {
						$table: 'people',
						$where: {
							$or: [
								{ first_name: 'John' },
								{ last_name: { $eq: 'Doe' } }
							]
						}
					}
				});

				expect(query).to.be.instanceOf(SQLQuery);
				expect(query.sql).to.equal('SELECT * FROM `people` WHERE `first_name` = ? OR `last_name` = ?');
				expect(query.values.length).to.equal(2);
				expect(query.values[0]).to.equal('John');
				expect(query.values[1]).to.equal('Doe');
			});
		}); // $where

		describe('$groupBy: { ... } | [ ... ]', function() {
			it('should return GROUP BY with all array items concatenated by `, `', function() {
				var query = sqlbuilder.build({
					$select: {
						$columns: ['first_name', 'last_name'],
						$table: 'people',
						$groupBy: ['first_name', 'last_name']
					}
				});

				expect(query).to.be.instanceOf(SQLQuery);
				expect(query.sql).to.equal('SELECT `first_name`, `last_name` FROM `people` GROUP BY `first_name`, `last_name`');
				expect(query.values.length).to.equal(0);
			});

			it('should return GROUP BY with all array items concatenated by `, ` and SUM aggregation', function() {
				var query = sqlbuilder.build({
					$select: {
						$columns: [
							'job_title',
							{ total_salary: { $sum: 'salary' } }
						],
						$table: 'people',
						$groupBy: ['job_title']
					}
				});

				expect(query).to.be.instanceOf(SQLQuery);
				expect(query.sql).to.equal('SELECT `job_title`, SUM(`salary`) AS `total_salary` FROM `people` GROUP BY `job_title`');
				expect(query.values.length).to.equal(0);
			});
		}); // $groupBy

		describe('$having: { ... }', function() {
			it('should return HAVING clause with extended expression', function() {
				var query = sqlbuilder.build({
					$select: {
						$columns: [
							'first_name',
							{ first_name_count: { $count: '*' } }
						],
						$table: 'people',
						$groupBy: ['first_name'],
						$having: {
							$expr: { $count: '*', $gt: 2 }
						}
					}
				});

				expect(query).to.be.instanceOf(SQLQuery);
				expect(query.sql).to.equal('SELECT `first_name`, COUNT(*) AS `first_name_count` FROM `people` GROUP BY `first_name` HAVING COUNT(*) > ?');
				expect(query.values.length).to.equal(1);
				expect(query.values[0]).to.equal(2);
			});

		}); // $groupBy

		describe('$sort: [ ... ] | { ... }', function() {
			it('should return ORDER BY clause with all columns concatenated by `, `', function() {
				var query = sqlbuilder.build({
					$select: {
						$table: 'people',
						$sort: ['last_name', 'first_name']
					}
				});

				expect(query).to.be.instanceOf(SQLQuery);
				expect(query.sql).to.equal('SELECT * FROM `people` ORDER BY `last_name`, `first_name`');
				expect(query.values.length).to.equal(0);
			});

			it('should return ORDER BY clause with ASC, DESC using $asc and $desc', function() {
				var query = sqlbuilder.build({
					$select: {
						$table: 'people',
						$sort: [
							{ last_name : { $asc: true } },
							{ first_name : { $desc: true } }
						]
					}
				});

				expect(query).to.be.instanceOf(SQLQuery);
				expect(query.sql).to.equal('SELECT * FROM `people` ORDER BY `last_name` ASC, `first_name` DESC');
				expect(query.values.length).to.equal(0);
			});

			it('should return ORDER BY clause using ASC, DESC defined by value', function() {
				var query = sqlbuilder.build({
					$select: {
						$table: 'people',
						$sort: [
							{ last_name : 'ASC' },
							{ first_name : 'DESC' }
						]
					}
				});

				expect(query).to.be.instanceOf(SQLQuery);
				expect(query.sql).to.equal('SELECT * FROM `people` ORDER BY `last_name` ASC, `first_name` DESC');
				expect(query.values.length).to.equal(0);
			});

			it('should return ORDER BY clause using ASC, DESC defined by number 1 | -1', function() {
				var query = sqlbuilder.build({
					$select: {
						$table: 'people',
						$sort: [
							{ last_name : 1 },
							{ first_name : -1 }
						]
					}
				});

				expect(query).to.be.instanceOf(SQLQuery);
				expect(query.sql).to.equal('SELECT * FROM `people` ORDER BY `last_name` ASC, `first_name` DESC');
				expect(query.values.length).to.equal(0);
			});

			it('should return ORDER BY clause defined as object using ASC, DESC by value', function() {
				var query = sqlbuilder.build({
					$select: {
						$table: 'people',
						$sort: {
							last_name : 'ASC',
							first_name : 'DESC'
						}
					}
				});

				expect(query).to.be.instanceOf(SQLQuery);
				expect(query.sql).to.equal('SELECT * FROM `people` ORDER BY `last_name` ASC, `first_name` DESC');
				expect(query.values.length).to.equal(0);
			});

			it('should return ORDER BY clause defined as object using ASC, DESC by number 1 | -1', function() {
				var query = sqlbuilder.build({
					$select: {
						$table: 'people',
						$sort: {
							last_name : 1,
							first_name : -1
						}
					}
				});

				expect(query).to.be.instanceOf(SQLQuery);
				expect(query.sql).to.equal('SELECT * FROM `people` ORDER BY `last_name` ASC, `first_name` DESC');
				expect(query.values.length).to.equal(0);
			});
		});
	});
});
