import { Knex } from "knex";


const TABLE_NAME = 'games';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTableIfNotExists(TABLE_NAME, (tableBuilder) => {
        tableBuilder.bigIncrements('game_id').primary().notNullable();
        tableBuilder.bigInteger('store_id').nullable();
        tableBuilder.string('store_front').nullable();
        tableBuilder.bigInteger('igdb_game_id').notNullable().defaultTo(0);
        tableBuilder.string('game_name').notNullable().defaultTo('');
        tableBuilder.date('release_date').notNullable().defaultTo(knex.fn.now());
        tableBuilder.integer('critic_rating').notNullable().defaultTo(0);
        tableBuilder.integer('community_rating').notNullable().defaultTo(0);
        tableBuilder.string('owned_status').notNullable().defaultTo('Owned')
        tableBuilder.string('played_status').notNullable().defaultTo('Unplayed');
        tableBuilder.string('completed_status').notNullable().defaultTo('Uncompleted');
        tableBuilder.integer('minutes_played').notNullable().defaultTo(0);
        tableBuilder.string('tier_ranking').notNullable().defaultTo('F');
        tableBuilder.string('genre').notNullable().defaultTo('');
        tableBuilder.float('how_long_to_beat_min').notNullable().defaultTo(0);
        tableBuilder.float('how_long_to_beat_mid').notNullable().defaultTo(0);
        tableBuilder.float('how_long_to_beat_max').notNullable().defaultTo(0);
    })
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists(TABLE_NAME);
}

