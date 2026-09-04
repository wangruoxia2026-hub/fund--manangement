# -*- coding: utf-8 -*-
"""
数据库初始化脚本
用于创建 SQLite 数据库及所有数据表
"""

import sqlite3
import os
from datetime import datetime

# 数据库文件路径（与主程序同一目录）
DB_FILE = 'fund_management.db'


def get_connection():
    """
    获取数据库连接
    
    Returns:
        sqlite3.Connection: 数据库连接对象
    """
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row  # 让查询结果可以通过字段名访问
    return conn


def create_tables():
    """
    创建所有数据表
    包括：基金表、节点表、节点提取信息表、文件表
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        # ========== 1. 基金表 (funds) ==========
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS funds (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(200) NOT NULL,
                code VARCHAR(50) NOT NULL UNIQUE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        print("[OK] Funds table created")
        
        # ========== 2. 节点表 (nodes) ==========
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS nodes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fund_id INTEGER NOT NULL,
                node_type VARCHAR(50) NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (fund_id) REFERENCES funds(id) ON DELETE CASCADE
            )
        ''')
        print("[OK] Nodes table created")
        
        # ========== 3. 节点提取信息表 (node_extractions) ==========
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS node_extractions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                node_id INTEGER NOT NULL,
                -- 首次/变更节点通用字段
                product_name VARCHAR(200),
                custodian VARCHAR(200),
                establish_date DATE,
                investment_manager VARCHAR(100),
                strategy TEXT,
                subscription_fee DECIMAL(10,2),
                custody_fee DECIMAL(10,2),
                risk_return VARCHAR(100),
                lock_period VARCHAR(100),
                annual_fee DECIMAL(10,2),
                performance_fee DECIMAL(10,2),
                investment_scope TEXT,
                investment_ratio TEXT,
                -- 分红节点专用字段
                dividend_count INTEGER,
                dividend_date DATE,
                dividend_amount DECIMAL(15,2),
                -- 自定义节点专用字段
                remark TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
            )
        ''')
        print("[OK] Node extractions table created")
        
        # ========== 4. 文件表 (files) ==========
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                node_id INTEGER NOT NULL,
                filename VARCHAR(255) NOT NULL,
                file_path VARCHAR(500) NOT NULL,
                file_size INTEGER,
                upload_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
            )
        ''')
        print("[OK] Files table created")
        
        # 提交事务
        conn.commit()
        print("\n[SUCCESS] Database initialization complete!")
        
    except sqlite3.Error as e:
        # 如果出错，回滚事务
        conn.rollback()
        print(f"[ERROR] Database initialization failed: {e}")
        raise
    finally:
        # 关闭连接
        conn.close()


def drop_all_tables():
    """
    删除所有数据表（谨慎使用！）
    用于测试或重置数据库
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        # 按照依赖关系顺序删除表（先删子表）
        cursor.execute('DROP TABLE IF EXISTS files')
        cursor.execute('DROP TABLE IF EXISTS node_extractions')
        cursor.execute('DROP TABLE IF EXISTS nodes')
        cursor.execute('DROP TABLE IF EXISTS funds')
        
        conn.commit()
        print("[OK] All tables dropped")
        
    except sqlite3.Error as e:
        conn.rollback()
        print(f"[ERROR] Failed to drop tables: {e}")
        raise
    finally:
        conn.close()


def show_tables():
    """
    显示数据库中所有表及其结构
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    # 获取所有表名
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    tables = cursor.fetchall()
    
    print("\n" + "="*60)
    print("DATABASE TABLES OVERVIEW")
    print("="*60)
    
    for table in tables:
        table_name = table[0]
        print(f"\nTable: {table_name}")
        print("-" * 40)
        
        # 获取表结构
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = cursor.fetchall()
        
        for col in columns:
            print(f"  {col[1]:20} | {col[2]:15} | {'NOT NULL' if col[3] else 'NULL'}")
    
    print("\n" + "="*60)
    conn.close()


if __name__ == '__main__':
    print("="*60)
    print("FUND MANAGEMENT SYSTEM - DATABASE INITIALIZATION")
    print("="*60)
    print(f"\nDatabase file: {os.path.abspath(DB_FILE)}")
    
    # 检查数据库文件是否存在
    if os.path.exists(DB_FILE):
        print(f"\n[WARNING] Database file exists, will recreate all tables")
        response = input("Continue? (y/n): ")
        if response.lower() != 'y':
            print("Initialization cancelled")
            exit(0)
    
    # 创建所有表
    create_tables()
    
    # 显示表结构
    show_tables()
