# -*- coding: utf-8 -*-
"""
插入样例数据
为数据库添加3组测试用的基金、节点和提取信息
"""

import sqlite3
import os
from datetime import datetime, timedelta

DB_FILE = 'fund_management.db'


def get_connection():
    """获取数据库连接"""
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn


def insert_sample_data():
    """
    插入3组样例数据
    
    样例数据包括：
    1. 华夏成长精选私募证券投资基金
    2. 东方红稳健收益私募基金
    3. 景林价值成长私募产品
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        print("="*60)
        print("INSERTING SAMPLE DATA")
        print("="*60)
        
        # ========== 样例数据1: 华夏成长精选 ==========
        print("\n[1/3] Creating: 华夏成长精选私募证券投资基金")
        
        # 插入基金1
        cursor.execute('''
            INSERT INTO funds (name, code, created_at, updated_at)
            VALUES (?, ?, ?, ?)
        ''', (
            '华夏成长精选私募证券投资基金',
            'HH001',
            datetime.now(),
            datetime.now()
        ))
        fund1_id = cursor.lastrowid
        print(f"  [OK] Fund created (ID: {fund1_id})")
        
        # 插入节点1-1: 首次
        cursor.execute('''
            INSERT INTO nodes (fund_id, node_type, created_at, updated_at)
            VALUES (?, ?, ?, ?)
        ''', (fund1_id, '首次', datetime.now(), datetime.now()))
        node1_1_id = cursor.lastrowid
        
        # 插入首次节点提取信息
        cursor.execute('''
            INSERT INTO node_extractions (
                node_id, product_name, custodian, establish_date,
                investment_manager, strategy, subscription_fee, custody_fee,
                risk_return, lock_period, annual_fee, performance_fee,
                investment_scope, investment_ratio, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            node1_1_id, '华夏成长精选私募证券投资基金', '招商银行托管部', '2024-01-15',
            '王建国', '股票多头策略', '1.2%', '0.15%',
            'R3中等风险', '12个月', '1.5%', '20%',
            'A股市场优质成长股', '股票80%-95%,现金5%-20%',
            datetime.now(), datetime.now()
        ))
        print(f"  [OK] First node created (ID: {node1_1_id})")
        
        # 插入节点1-2: 变更
        cursor.execute('''
            INSERT INTO nodes (fund_id, node_type, created_at, updated_at)
            VALUES (?, ?, ?, ?)
        ''', (fund1_id, '变更', datetime.now() - timedelta(days=30), datetime.now() - timedelta(days=30)))
        node1_2_id = cursor.lastrowid
        
        cursor.execute('''
            INSERT INTO node_extractions (
                node_id, product_name, custodian, establish_date,
                investment_manager, strategy, subscription_fee, custody_fee,
                risk_return, lock_period, annual_fee, performance_fee,
                investment_scope, investment_ratio, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            node1_2_id, '华夏成长精选私募证券投资基金', '招商银行托管部', '2024-01-15',
            '李明辉', '股票多头策略', '1.0%', '0.12%',
            'R3中等风险', '6个月', '1.2%', '15%',
            'A股及港股优质成长股', '股票70%-90%,现金10%-30%',
            datetime.now() - timedelta(days=30), datetime.now() - timedelta(days=30)
        ))
        print(f"  [OK] Change node created (ID: {node1_2_id})")
        
        # 插入节点1-3: 分红
        cursor.execute('''
            INSERT INTO nodes (fund_id, node_type, created_at, updated_at)
            VALUES (?, ?, ?, ?)
        ''', (fund1_id, '分红', datetime.now() - timedelta(days=15), datetime.now() - timedelta(days=15)))
        node1_3_id = cursor.lastrowid
        
        cursor.execute('''
            INSERT INTO node_extractions (
                node_id, dividend_count, dividend_date, dividend_amount, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            node1_3_id, 2, '2024-06-30', 1500000.00,
            datetime.now() - timedelta(days=15), datetime.now() - timedelta(days=15)
        ))
        print(f"  [OK] Dividend node created (ID: {node1_3_id})")
        
        
        # ========== 样例数据2: 东方红稳健收益 ==========
        print("\n[2/3] Creating: 东方红稳健收益私募基金")
        
        cursor.execute('''
            INSERT INTO funds (name, code, created_at, updated_at)
            VALUES (?, ?, ?, ?)
        ''', (
            '东方红稳健收益私募基金',
            'DFH002',
            datetime.now(),
            datetime.now()
        ))
        fund2_id = cursor.lastrowid
        print(f"  [OK] Fund created (ID: {fund2_id})")
        
        # 首次节点
        cursor.execute('''
            INSERT INTO nodes (fund_id, node_type, created_at, updated_at)
            VALUES (?, ?, ?, ?)
        ''', (fund2_id, '首次', datetime.now(), datetime.now()))
        node2_1_id = cursor.lastrowid
        
        cursor.execute('''
            INSERT INTO node_extractions (
                node_id, product_name, custodian, establish_date,
                investment_manager, strategy, subscription_fee, custody_fee,
                risk_return, lock_period, annual_fee, performance_fee,
                investment_scope, investment_ratio, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            node2_1_id, '东方红稳健收益私募基金', '工商银行托管', '2024-03-01',
            '张伟', '固收+策略', '0.8%', '0.10%',
            'R2中低风险', '3个月', '0.8%', '10%',
            '债券为主，股票增强', '债券60%-80%,股票10%-30%,现金10%',
            datetime.now(), datetime.now()
        ))
        print(f"  [OK] First node created (ID: {node2_1_id})")
        
        # 自定义节点
        cursor.execute('''
            INSERT INTO nodes (fund_id, node_type, created_at, updated_at)
            VALUES (?, ?, ?, ?)
        ''', (fund2_id, '自定义', datetime.now() - timedelta(days=10), datetime.now() - timedelta(days=10)))
        node2_2_id = cursor.lastrowid
        
        cursor.execute('''
            INSERT INTO node_extractions (node_id, remark, created_at, updated_at)
            VALUES (?, ?, ?, ?)
        ''', (
            node2_2_id, '基金经理变更通知：原基金经理张伟因个人原因离职，现由陈静接任。托管人不变。',
            datetime.now() - timedelta(days=10), datetime.now() - timedelta(days=10)
        ))
        print(f"  [OK] Custom node created (ID: {node2_2_id})")
        
        
        # ========== 样例数据3: 景林价值成长 ==========
        print("\n[3/3] Creating: 景林价值成长私募产品")
        
        cursor.execute('''
            INSERT INTO funds (name, code, created_at, updated_at)
            VALUES (?, ?, ?, ?)
        ''', (
            '景林价值成长私募产品',
            'JL003',
            datetime.now(),
            datetime.now()
        ))
        fund3_id = cursor.lastrowid
        print(f"  [OK] Fund created (ID: {fund3_id})")
        
        # 首次节点
        cursor.execute('''
            INSERT INTO nodes (fund_id, node_type, created_at, updated_at)
            VALUES (?, ?, ?, ?)
        ''', (fund3_id, '首次', datetime.now(), datetime.now()))
        node3_1_id = cursor.lastrowid
        
        cursor.execute('''
            INSERT INTO node_extractions (
                node_id, product_name, custodian, establish_date,
                investment_manager, strategy, subscription_fee, custody_fee,
                risk_return, lock_period, annual_fee, performance_fee,
                investment_scope, investment_ratio, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            node3_1_id, '景林价值成长私募产品', '建设银行托管', '2024-06-01',
            '高云峰', '价值投资策略', '1.5%', '0.18%',
            'R4中高风险', '24个月', '2.0%', '25%',
            'A股及港股价值型企业', '股票60%-85%,现金15%-40%',
            datetime.now(), datetime.now()
        ))
        print(f"  [OK] First node created (ID: {node3_1_id})")
        
        # 分红节点
        cursor.execute('''
            INSERT INTO nodes (fund_id, node_type, created_at, updated_at)
            VALUES (?, ?, ?, ?)
        ''', (fund3_id, '分红', datetime.now() - timedelta(days=5), datetime.now() - timedelta(days=5)))
        node3_2_id = cursor.lastrowid
        
        cursor.execute('''
            INSERT INTO node_extractions (
                node_id, dividend_count, dividend_date, dividend_amount, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            node3_2_id, 1, '2024-08-15', 2800000.00,
            datetime.now() - timedelta(days=5), datetime.now() - timedelta(days=5)
        ))
        print(f"  [OK] Dividend node created (ID: {node3_2_id})")
        
        # 提交事务
        conn.commit()
        print("\n" + "="*60)
        print("[SUCCESS] Sample data inserted successfully!")
        print("="*60)
        
        # 显示统计信息
        cursor.execute("SELECT COUNT(*) as count FROM funds")
        fund_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) as count FROM nodes")
        node_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) as count FROM node_extractions")
        extraction_count = cursor.fetchone()[0]
        
        print(f"\nStatistics:")
        print(f"  - Funds: {fund_count}")
        print(f"  - Nodes: {node_count}")
        print(f"  - Extractions: {extraction_count}")
        
    except sqlite3.Error as e:
        conn.rollback()
        print(f"\n[ERROR] Failed to insert sample data: {e}")
        raise
    finally:
        conn.close()


def show_all_data():
    """显示所有数据"""
    conn = get_connection()
    cursor = conn.cursor()
    
    print("\n" + "="*60)
    print("ALL DATA IN DATABASE")
    print("="*60)
    
    # 显示基金
    print("\n--- FUNDS ---")
    cursor.execute("SELECT * FROM funds ORDER BY id")
    funds = cursor.fetchall()
    for fund in funds:
        print(f"ID:{fund['id']} | {fund['name']} | Code:{fund['code']}")
    
    # 显示节点
    print("\n--- NODES ---")
    cursor.execute('''
        SELECT n.*, f.name as fund_name 
        FROM nodes n 
        JOIN funds f ON n.fund_id = f.id 
        ORDER BY n.id
    ''')
    nodes = cursor.fetchall()
    for node in nodes:
        print(f"ID:{node['id']} | Fund:{node['fund_name']} | Type:{node['node_type']}")
    
    conn.close()


if __name__ == '__main__':
    # 检查数据库是否存在
    if not os.path.exists(DB_FILE):
        print(f"[ERROR] Database '{DB_FILE}' not found!")
        print("Please run 'python init_db.py' first.")
        exit(1)
    
    # 插入样例数据
    insert_sample_data()
    
    # 显示所有数据
    show_all_data()
