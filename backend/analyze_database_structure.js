const { Client } = require('pg');
require('dotenv').config();

async function analyzeDatabaseStructure() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('🔗 Connected to Supabase database');
    console.log('=' .repeat(80));

    // STEP 1: Get all tables in the database
    console.log('\n📋 STEP 1: ALL TABLES IN DATABASE');
    const allTables = await client.query(`
      SELECT 
        table_name,
        table_type
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    console.log(`Found ${allTables.rows.length} tables:`);
    allTables.rows.forEach((table, index) => {
      console.log(`  ${index + 1}. ${table.table_name}`);
    });

    // STEP 2: Analyze each table structure
    console.log('\n📋 STEP 2: DETAILED TABLE ANALYSIS');
    console.log('=' .repeat(80));
    
    const tableAnalysis = {};
    
    for (const table of allTables.rows) {
      const tableName = table.table_name;
      console.log(`\n🔍 Analyzing table: ${tableName}`);
      console.log('-'.repeat(50));
      
      // Get table structure
      const structure = await client.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length,
          numeric_precision,
          numeric_scale,
          ordinal_position
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position;
      `, [tableName]);
      
      // Get primary key
      const primaryKey = await client.query(`
        SELECT 
          kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = $1 
        AND tc.constraint_type = 'PRIMARY KEY';
      `, [tableName]);
      
      // Get foreign keys
      const foreignKeys = await client.query(`
        SELECT 
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name,
          rc.delete_rule,
          rc.update_rule
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu 
          ON ccu.constraint_name = tc.constraint_name
        JOIN information_schema.referential_constraints rc 
          ON tc.constraint_name = rc.constraint_name
        WHERE tc.table_name = $1 
        AND tc.constraint_type = 'FOREIGN KEY';
      `, [tableName]);
      
      // Get indexes
      const indexes = await client.query(`
        SELECT 
          indexname,
          indexdef
        FROM pg_indexes 
        WHERE tablename = $1;
      `, [tableName]);
      
      // Get sample data count
      const rowCount = await client.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      
      // Store analysis results
      tableAnalysis[tableName] = {
        structure: structure.rows,
        primaryKey: primaryKey.rows.map(pk => pk.column_name),
        foreignKeys: foreignKeys.rows,
        indexes: indexes.rows,
        rowCount: parseInt(rowCount.rows[0].count)
      };
      
      // Display table info
      console.log(`  📊 Row count: ${rowCount.rows[0].count}`);
      
      if (primaryKey.rows.length > 0) {
        console.log(`  🔑 Primary Key: ${primaryKey.rows.map(pk => pk.column_name).join(', ')}`);
      }
      
      if (foreignKeys.rows.length > 0) {
        console.log(`  🔗 Foreign Keys:`);
        foreignKeys.rows.forEach(fk => {
          console.log(`    - ${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name} (${fk.delete_rule}/${fk.update_rule})`);
        });
      }
      
      console.log(`  📋 Columns (${structure.rows.length}):`);
      structure.rows.forEach(col => {
        let colInfo = `    - ${col.column_name}: ${col.data_type}`;
        if (col.character_maximum_length) {
          colInfo += `(${col.character_maximum_length})`;
        }
        if (col.numeric_precision) {
          colInfo += `(${col.numeric_precision}`;
          if (col.numeric_scale) {
            colInfo += `,${col.numeric_scale}`;
          }
          colInfo += ')';
        }
        if (col.is_nullable === 'NO') {
          colInfo += ' NOT NULL';
        }
        if (col.column_default) {
          colInfo += ` DEFAULT ${col.column_default}`;
        }
        console.log(colInfo);
      });
      
      if (indexes.rows.length > 0) {
        console.log(`  📈 Indexes (${indexes.rows.length}):`);
        indexes.rows.forEach(idx => {
          console.log(`    - ${idx.indexname}`);
        });
      }
    }

    // STEP 3: Analyze relationships and dependencies
    console.log('\n📋 STEP 3: RELATIONSHIP ANALYSIS');
    console.log('=' .repeat(80));
    
    const relationships = {};
    const circularDependencies = [];
    
    for (const [tableName, analysis] of Object.entries(tableAnalysis)) {
      relationships[tableName] = {
        references: [],
        referencedBy: []
      };
      
      // Find tables this table references
      analysis.foreignKeys.forEach(fk => {
        relationships[tableName].references.push(fk.foreign_table_name);
      });
      
      // Find tables that reference this table
      for (const [otherTable, otherAnalysis] of Object.entries(tableAnalysis)) {
        otherAnalysis.foreignKeys.forEach(fk => {
          if (fk.foreign_table_name === tableName) {
            if (!relationships[tableName].referencedBy) {
              relationships[tableName].referencedBy = [];
            }
            relationships[tableName].referencedBy.push(otherTable);
          }
        });
      }
    }
    
    // Display relationships
    for (const [tableName, rel] of Object.entries(relationships)) {
      console.log(`\n🔗 ${tableName}:`);
      if (rel.references.length > 0) {
        console.log(`  References: ${rel.references.join(', ')}`);
      }
      if (rel.referencedBy.length > 0) {
        console.log(`  Referenced by: ${rel.referencedBy.join(', ')}`);
      }
    }
    
    // STEP 4: Identify potential issues
    console.log('\n📋 STEP 4: POTENTIAL ISSUES IDENTIFIED');
    console.log('=' .repeat(80));
    
    const issues = [];
    
    // Check for tables without primary keys
    for (const [tableName, analysis] of Object.entries(tableAnalysis)) {
      if (analysis.primaryKey.length === 0) {
        issues.push(`❌ ${tableName}: No primary key defined`);
      }
    }
    
    // Check for orphaned foreign keys
    for (const [tableName, analysis] of Object.entries(tableAnalysis)) {
      analysis.foreignKeys.forEach(fk => {
        if (!tableAnalysis[fk.foreign_table_name]) {
          issues.push(`❌ ${tableName}: Foreign key references non-existent table ${fk.foreign_table_name}`);
        }
      });
    }
    
    // Check for potential circular dependencies
    for (const [tableName, rel] of Object.entries(relationships)) {
      if (rel.references.includes(tableName)) {
        issues.push(`⚠️  ${tableName}: Self-referencing foreign key detected`);
      }
      
      // Check for circular references (A → B → C → A)
      const visited = new Set();
      const checkCircular = (current, path) => {
        if (visited.has(current)) return;
        visited.add(current);
        
        if (path.includes(current)) {
          const cycle = path.slice(path.indexOf(current));
          circularDependencies.push([...cycle, current]);
          return;
        }
        
        relationships[current]?.references.forEach(ref => {
          checkCircular(ref, [...path, current]);
        });
      };
      
      checkCircular(tableName, []);
    }
    
    // Check for missing indexes on foreign keys
    for (const [tableName, analysis] of Object.entries(tableAnalysis)) {
      analysis.foreignKeys.forEach(fk => {
        const hasIndex = analysis.indexes.some(idx => 
          idx.indexdef.includes(fk.column_name)
        );
        if (!hasIndex) {
          issues.push(`⚠️  ${tableName}: Foreign key ${fk.column_name} missing index`);
        }
      });
    }
    
    // Check for appropriate data types
    for (const [tableName, analysis] of Object.entries(tableAnalysis)) {
      analysis.structure.forEach(col => {
        if (col.data_type === 'text' && col.column_name.includes('id')) {
          issues.push(`⚠️  ${tableName}: Column ${col.column_name} is TEXT but looks like an ID`);
        }
        if (col.data_type === 'character varying' && col.character_maximum_length === 255 && col.column_name.includes('id')) {
          issues.push(`⚠️  ${tableName}: Column ${col.column_name} is VARCHAR(255) but looks like an ID`);
        }
      });
    }
    
    // Display issues
    if (issues.length === 0) {
      console.log('✅ No critical issues found!');
    } else {
      issues.forEach(issue => console.log(issue));
    }
    
    if (circularDependencies.length > 0) {
      console.log('\n🔄 CIRCULAR DEPENDENCIES DETECTED:');
      circularDependencies.forEach(cycle => {
        console.log(`  ${cycle.join(' → ')}`);
      });
    }
    
    // STEP 5: Recommendations
    console.log('\n📋 STEP 5: RECOMMENDATIONS');
    console.log('=' .repeat(80));
    
    console.log('\n🎯 IMMEDIATE ACTIONS:');
    
    // Add missing indexes
    const missingIndexes = [];
    for (const [tableName, analysis] of Object.entries(tableAnalysis)) {
      analysis.foreignKeys.forEach(fk => {
        const hasIndex = analysis.indexes.some(idx => 
          idx.indexdef.includes(fk.column_name)
        );
        if (!hasIndex) {
          missingIndexes.push(`CREATE INDEX idx_${tableName}_${fk.column_name} ON ${tableName}(${fk.column_name});`);
        }
      });
    }
    
    if (missingIndexes.length > 0) {
      console.log('\n📈 Add missing indexes:');
      missingIndexes.forEach(idx => console.log(`  ${idx}`));
    }
    
    // Check for tables that could be schemas
    const potentialSchemas = ['sw_', 'auth_', 'public_'];
    const schemaCandidates = allTables.rows.filter(table => 
      potentialSchemas.some(prefix => table.table_name.startsWith(prefix))
    );
    
    if (schemaCandidates.length > 0) {
      console.log('\n🏗️  Consider organizing tables into schemas:');
      console.log('  - sw_* tables → smartwish schema');
      console.log('  - auth_* tables → auth schema');
      console.log('  - Core tables → public schema');
    }
    
    // STEP 6: Summary
    console.log('\n📋 STEP 6: SUMMARY');
    console.log('=' .repeat(80));
    
    console.log(`\n📊 Database Overview:`);
    console.log(`  - Total tables: ${allTables.rows.length}`);
    console.log(`  - Total relationships: ${Object.values(tableAnalysis).reduce((sum, t) => sum + t.foreignKeys.length, 0)}`);
    console.log(`  - Tables with issues: ${issues.length}`);
    console.log(`  - Circular dependencies: ${circularDependencies.length}`);
    
    console.log('\n✅ Database analysis completed successfully!');
    
    // Return analysis data for further processing
    return {
      tables: tableAnalysis,
      relationships,
      issues,
      circularDependencies
    };

  } catch (error) {
    console.error('❌ Error during database analysis:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the analysis
analyzeDatabaseStructure()
  .then(results => {
    console.log('\n🎉 Analysis complete! Check the results above.');
  })
  .catch(error => {
    console.error('💥 Analysis failed:', error);
    process.exit(1);
  });
