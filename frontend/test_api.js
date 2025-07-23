// Docker環境内でAPIを呼び出すテスト
import axios from 'axios';

async function testAPI() {
    try {
        // 田中太郎でログイン
        const loginResponse = await axios.post('http://backend:8000/api/login', {
            email: 'tanaka@example.com',
            password: 'taro2024'
        });
        
        const token = loginResponse.data.token;
        console.log('Login successful, token:', token);
        
        // 2025年7月の売上データを取得
        const salesResponse = await axios.get('http://backend:8000/api/sales?month=2025-07', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        
        console.log('\n=== 2025年7月の売上データ ===');
        console.log('Total records:', salesResponse.data.data.data.length);
        
        // 最初の5件を表示
        console.log('\n最初の5件:');
        salesResponse.data.data.data.slice(0, 5).forEach((sale, index) => {
            console.log(`${index + 1}. ID: ${sale.id}, paid_at: ${sale.paid_at}, amount: ${sale.amount}`);
        });
        
        // 最後の5件を表示
        console.log('\n最後の5件:');
        salesResponse.data.data.data.slice(-5).forEach((sale, index) => {
            console.log(`${salesResponse.data.data.data.length - 4 + index}. ID: ${sale.id}, paid_at: ${sale.paid_at}, amount: ${sale.amount}`);
        });
        
        // ID: 219のデータが含まれているかチェック
        const problem219 = salesResponse.data.data.data.find(sale => sale.id === 219);
        console.log('\nID: 219のデータが含まれているか:', problem219 ? 'Yes' : 'No');
        if (problem219) {
            console.log('ID: 219 Data:', problem219);
        }
        
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

testAPI();